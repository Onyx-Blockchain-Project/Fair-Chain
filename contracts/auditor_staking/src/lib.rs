#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    Address, Env, String, Symbol, Vec, token
};

const MINIMUM_STAKE: i128 = 500_0000000;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    InsufficientStake = 1,
    NotStaked = 2,
    AlreadyStaked = 3,
    ActiveAuditExists = 4,
    InvalidRegion = 5,
    TransferFailed = 6,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Stake {
    pub amount: i128,
    pub geo_region: String,
    pub staked_at: u64,
    pub reputation_score: u32,
    pub audit_count: u32,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ActiveAudit {
    pub factory: Address,
    pub started_at: u64,
    pub evidence_count: u32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Stake(Address),
    ActiveAudits(Address),
    TokenContract,
    TotalStaked,
    AuditorsByRegion(String),
    SlashHistory(Address),
}

#[contract]
pub struct AuditorStaking;

#[contractimpl]
impl AuditorStaking {
    pub fn initialize(env: Env, admin: Address, token_contract: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenContract, &token_contract);
        env.storage().instance().set(&DataKey::TotalStaked, &0i128);
    }

    pub fn stake_as_auditor(
        env: Env,
        auditor: Address,
        amount: i128,
        geo_region: String,
    ) -> Result<(), Error> {
        auditor.require_auth();

        if amount < MINIMUM_STAKE {
            return Err(Error::InsufficientStake);
        }

        if env.storage().persistent().has(&DataKey::Stake(auditor.clone())) {
            return Err(Error::AlreadyStaked);
        }

        if geo_region.is_empty() {
            return Err(Error::InvalidRegion);
        }

        let token_client = token::Client::new(&env, &env
            .storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::TokenContract)
            .unwrap());

        let contract_address = env.current_contract_address();
        let transfer_result = token_client.try_transfer(&auditor, &contract_address, &amount);
        
        if transfer_result.is_err() {
            return Err(Error::TransferFailed);
        }

        let stake = Stake {
            amount,
            geo_region: geo_region.clone(),
            staked_at: env.ledger().timestamp(),
            reputation_score: 100,
            audit_count: 0,
            is_active: true,
        };

        env.storage().persistent().set(&DataKey::Stake(auditor.clone()), &stake);

        let mut total_staked = env
            .storage()
            .instance()
            .get::<DataKey, i128>(&DataKey::TotalStaked)
            .unwrap_or(0);
        total_staked += amount;
        env.storage().instance().set(&DataKey::TotalStaked, &total_staked);

        Self::add_to_region_index(&env, geo_region, auditor.clone());

        env.events().publish(
            (Symbol::new(&env, "auditor_staked"), auditor.clone()),
            (amount, env.ledger().timestamp()),
        );

        Ok(())
    }

    pub fn unstake(env: Env, auditor: Address) -> Result<i128, Error> {
        auditor.require_auth();

        let stake = Self::get_stake(env.clone(), auditor.clone())?;
        
        let active_audits: Vec<ActiveAudit> = env
            .storage()
            .persistent()
            .get(&DataKey::ActiveAudits(auditor.clone()))
            .unwrap_or(Vec::new(&env));
        
        if !active_audits.is_empty() {
            return Err(Error::ActiveAuditExists);
        }

        let token_client = token::Client::new(&env, &env
            .storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::TokenContract)
            .unwrap());

        let contract_address = env.current_contract_address();
        token_client.transfer(&contract_address, &auditor, &stake.amount);

        env.storage().persistent().remove(&DataKey::Stake(auditor.clone()));

        let mut total_staked = env
            .storage()
            .instance()
            .get::<DataKey, i128>(&DataKey::TotalStaked)
            .unwrap_or(0);
        total_staked -= stake.amount;
        env.storage().instance().set(&DataKey::TotalStaked, &total_staked);

        env.events().publish(
            (Symbol::new(&env, "auditor_unstaked"), auditor.clone()),
            (stake.amount, env.ledger().timestamp()),
        );

        Ok(stake.amount)
    }

    pub fn slash_stake(
        env: Env,
        auditor: Address,
        slash_amount: i128,
    ) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();
        admin.require_auth();

        let mut stake = Self::get_stake(env.clone(), auditor.clone())?;
        
        if slash_amount > stake.amount {
            stake.amount = 0;
        } else {
            stake.amount -= slash_amount;
        }

        stake.reputation_score = stake.reputation_score.saturating_sub(20);

        if stake.amount < MINIMUM_STAKE {
            stake.is_active = false;
        }

        env.storage().persistent().set(&DataKey::Stake(auditor.clone()), &stake);

        let slash_history_key = DataKey::SlashHistory(auditor.clone());
        let mut slash_count: u32 = env
            .storage()
            .persistent()
            .get(&slash_history_key)
            .unwrap_or(0);
        slash_count += 1;
        env.storage().persistent().set(&slash_history_key, &slash_count);

        env.events().publish(
            (Symbol::new(&env, "auditor_slashed"), auditor.clone()),
            (slash_amount, env.ledger().timestamp()),
        );

        Ok(())
    }

    pub fn record_audit_completion(
        env: Env,
        auditor: Address,
        factory: Address,
        evidence_count: u32,
    ) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();
        admin.require_auth();

        let mut stake = Self::get_stake(env.clone(), auditor.clone())?;
        
        stake.audit_count += 1;
        
        if evidence_count > 5 && evidence_count <= 10 {
            stake.reputation_score += 2;
        } else if evidence_count > 10 {
            stake.reputation_score += 5;
        }
        
        stake.reputation_score = stake.reputation_score.min(1000);

        env.storage().persistent().set(&DataKey::Stake(auditor.clone()), &stake);

        env.events().publish(
            (Symbol::new(&env, "audit_completed"), auditor.clone()),
            (factory, evidence_count, stake.reputation_score),
        );

        Ok(())
    }

    pub fn get_stake(env: Env, auditor: Address) -> Result<Stake, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Stake(auditor))
            .ok_or(Error::NotStaked)
    }

    pub fn get_total_staked(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalStaked)
            .unwrap_or(0)
    }

    pub fn get_auditors_by_region(env: Env, region: String) -> Vec<Address> {
        env.storage()
            .persistent()
            .get(&DataKey::AuditorsByRegion(region))
            .unwrap_or(Vec::new(&env))
    }

    pub fn is_active_auditor(env: Env, auditor: Address) -> bool {
        if let Ok(stake) = Self::get_stake(env, auditor) {
            stake.is_active && stake.amount >= MINIMUM_STAKE
        } else {
            false
        }
    }

    fn add_to_region_index(env: &Env, region: String, auditor: Address) {
        let key = DataKey::AuditorsByRegion(region);
        let mut auditors: Vec<Address> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Vec::new(env));
        auditors.push_back(auditor);
        env.storage().persistent().set(&key, &auditors);
    }
}
