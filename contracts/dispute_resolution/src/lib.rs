#![no_std]
use soroban_sdk::{
    contract,
    contracterror,
    contractimpl,
    contracttype,
    Address,
    Env,
    String,
    Symbol,
    Vec,
};

const MIN_ARBITRATORS: u32 = 3;
const RESOLUTION_THRESHOLD: u32 = 2;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    DisputeNotFound = 1,
    AlreadyResolved = 2,
    InvalidArbitrators = 3,
    NotArbitrator = 4,
    AlreadyVoted = 5,
    DisputePeriodActive = 6,
    NotAuthorized = 7,
    AuditNotFound = 8,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Dispute {
    pub dispute_id: u128,
    pub audit_id: u128,
    pub challenger: Address,
    pub factory: Address,
    pub auditor: Address,
    pub arbitrators: Vec<Address>,
    pub votes_for_challenger: u32,
    pub votes_for_auditor: u32,
    pub has_voted: Vec<Address>,
    pub resolution: Resolution,
    pub reason: String,
    pub filed_at: u64,
    pub resolved_at: u64,
    pub slash_amount: i128,
    pub is_appealed: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Resolution {
    Pending,
    ChallengerWins,
    AuditorWins,
    SplitDecision,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Dispute(u128),
    DisputeCounter,
    AuditToDispute(u128),
    AuthorizedFilers,
}

#[contract]
pub struct DisputeResolution;

#[contractimpl]
impl DisputeResolution {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::DisputeCounter, &0u128);

        let filers: Vec<Address> = Vec::new(&env);
        env.storage().persistent().set(&DataKey::AuthorizedFilers, &filers);
    }

    pub fn add_authorized_filer(env: Env, filer: Address) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();
        admin.require_auth();

        let mut filers: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::AuthorizedFilers)
            .unwrap_or(Vec::new(&env));
        
        if !filers.contains(&filer) {
            filers.push_back(filer);
            env.storage().persistent().set(&DataKey::AuthorizedFilers, &filers);
        }
    }

    pub fn file_dispute(
        env: Env,
        audit_id: u128,
        challenger: Address,
        factory: Address,
        auditor: Address,
        arbitrators: Vec<Address>,
        reason: String,
    ) -> Result<Dispute, Error> {
        challenger.require_auth();

        if arbitrators.len() < MIN_ARBITRATORS {
            return Err(Error::InvalidArbitrators);
        }

        if env.storage().persistent().has(&DataKey::AuditToDispute(audit_id)) {
            return Err(Error::AlreadyResolved);
        }

        let dispute_id = env
            .storage()
            .instance()
            .get::<DataKey, u128>(&DataKey::DisputeCounter)
            .unwrap_or(0);
        
        let new_counter = dispute_id + 1;
        env.storage().instance().set(&DataKey::DisputeCounter, &new_counter);

        let dispute = Dispute {
            dispute_id,
            audit_id,
            challenger: challenger.clone(),
            factory,
            auditor,
            arbitrators,
            votes_for_challenger: 0,
            votes_for_auditor: 0,
            has_voted: Vec::new(&env),
            resolution: Resolution::Pending,
            reason,
            filed_at: env.ledger().timestamp(),
            resolved_at: 0,
            slash_amount: 0,
            is_appealed: false,
        };

        env.storage().persistent().set(&DataKey::Dispute(dispute_id), &dispute);
        env.storage().persistent().set(&DataKey::AuditToDispute(audit_id), &dispute_id);

        env.events().publish(
            (Symbol::new(&env, "dispute_filed"), dispute_id),
            (audit_id, challenger, env.ledger().timestamp()),
        );

        Ok(dispute)
    }

    pub fn submit_vote(
        env: Env,
        dispute_id: u128,
        arbitrator: Address,
        vote_for_challenger: bool,
    ) -> Result<(), Error> {
        arbitrator.require_auth();

        let mut dispute = Self::get_dispute(env.clone(), dispute_id)?;

        if !matches!(dispute.resolution, Resolution::Pending) {
            return Err(Error::AlreadyResolved);
        }

        if !dispute.arbitrators.contains(&arbitrator) {
            return Err(Error::NotArbitrator);
        }

        if dispute.has_voted.contains(&arbitrator) {
            return Err(Error::AlreadyVoted);
        }

        dispute.has_voted.push_back(arbitrator.clone());

        if vote_for_challenger {
            dispute.votes_for_challenger += 1;
        } else {
            dispute.votes_for_auditor += 1;
        }

        env.storage().persistent().set(&DataKey::Dispute(dispute_id), &dispute);

        env.events().publish(
            (Symbol::new(&env, "vote_submitted"), dispute_id),
            (arbitrator, vote_for_challenger, dispute.has_voted.len()),
        );

        if dispute.has_voted.len() as u32 >= MIN_ARBITRATORS {
            let _ = Self::resolve_dispute(env, dispute_id);
        }

        Ok(())
    }

    pub fn resolve_dispute(env: Env, dispute_id: u128) -> Result<Dispute, Error> {
        let mut dispute = Self::get_dispute(env.clone(), dispute_id)?;

        if !matches!(dispute.resolution, Resolution::Pending) {
            return Err(Error::AlreadyResolved);
        }

        if (dispute.has_voted.len() as u32) < MIN_ARBITRATORS {
            return Err(Error::DisputePeriodActive);
        }

        dispute.resolution = if dispute.votes_for_challenger >= RESOLUTION_THRESHOLD {
            Resolution::ChallengerWins
        } else if dispute.votes_for_auditor >= RESOLUTION_THRESHOLD {
            Resolution::AuditorWins
        } else {
            Resolution::SplitDecision
        };

        dispute.resolved_at = env.ledger().timestamp();

        if matches!(dispute.resolution, Resolution::ChallengerWins) {
            dispute.slash_amount = Self::calculate_slash_amount(&env);
        }

        env.storage().persistent().set(&DataKey::Dispute(dispute_id), &dispute);

        env.events().publish(
            (Symbol::new(&env, "dispute_resolved"), dispute_id),
            (dispute.resolution.clone(), dispute.slash_amount, dispute.resolved_at),
        );

        Ok(dispute)
    }

    pub fn appeal_dispute(env: Env, dispute_id: u128, appellant: Address) -> Result<(), Error> {
        appellant.require_auth();

        let mut dispute = Self::get_dispute(env.clone(), dispute_id)?;

        if !matches!(dispute.resolution, Resolution::ChallengerWins | Resolution::AuditorWins) {
            return Err(Error::InvalidArbitrators);
        }

        if dispute.is_appealed {
            return Err(Error::AlreadyResolved);
        }

        let resolution_time = dispute.resolved_at;
        let current_time = env.ledger().timestamp();
        let days_since_resolution = (current_time - resolution_time) / (24 * 60 * 60);

        if days_since_resolution > 7 {
            return Err(Error::DisputePeriodActive);
        }

        dispute.is_appealed = true;
        dispute.resolution = Resolution::Pending;
        dispute.votes_for_challenger = 0;
        dispute.votes_for_auditor = 0;
        dispute.has_voted = Vec::new(&env);
        dispute.arbitrators = Self::select_new_arbitrators(&env, &dispute);
        dispute.slash_amount = 0;

        env.storage().persistent().set(&DataKey::Dispute(dispute_id), &dispute);

        env.events().publish(
            (Symbol::new(&env, "dispute_appealed"), dispute_id),
            (appellant, dispute.arbitrators.len(), current_time),
        );

        Ok(())
    }

    pub fn get_dispute(env: Env, dispute_id: u128) -> Result<Dispute, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Dispute(dispute_id))
            .ok_or(Error::DisputeNotFound)
    }

    pub fn get_dispute_by_audit(env: Env, audit_id: u128) -> Result<Dispute, Error> {
        let dispute_id: u128 = env
            .storage()
            .persistent()
            .get(&DataKey::AuditToDispute(audit_id))
            .ok_or(Error::AuditNotFound)?;
        
        Self::get_dispute(env, dispute_id)
    }

    pub fn is_dispute_resolved(env: Env, dispute_id: u128) -> bool {
        if let Ok(dispute) = Self::get_dispute(env, dispute_id) {
            !matches!(dispute.resolution, Resolution::Pending)
        } else {
            false
        }
    }

    pub fn should_slash_auditor(env: Env, dispute_id: u128) -> Result<(bool, i128), Error> {
        let dispute = Self::get_dispute(env, dispute_id)?;
        
        if matches!(dispute.resolution, Resolution::ChallengerWins) {
            Ok((true, dispute.slash_amount))
        } else {
            Ok((false, 0))
        }
    }

    pub fn get_dispute_stats(env: Env) -> (u128, u128, u128) {
        let counter = env
            .storage()
            .instance()
            .get::<DataKey, u128>(&DataKey::DisputeCounter)
            .unwrap_or(0);

        let mut resolved = 0u128;
        let mut pending = 0u128;

        for i in 0..counter {
            if let Some(dispute) = env
                .storage()
                .persistent()
                .get::<DataKey, Dispute>(&DataKey::Dispute(i))
            {
                if matches!(dispute.resolution, Resolution::Pending) {
                    pending += 1;
                } else {
                    resolved += 1;
                }
            }
        }

        (counter, resolved, pending)
    }

    fn calculate_slash_amount(_env: &Env) -> i128 {
        100_0000000
    }

    fn select_new_arbitrators(env: &Env, dispute: &Dispute) -> Vec<Address> {
        let mut new_arbitrators = Vec::new(env);
        
        for arb in dispute.arbitrators.iter() {
            if !dispute.has_voted.contains(&arb) {
                new_arbitrators.push_back(arb);
            }
        }

        if new_arbitrators.len() < MIN_ARBITRATORS {
            dispute.arbitrators.clone()
        } else {
            new_arbitrators
        }
    }
}
