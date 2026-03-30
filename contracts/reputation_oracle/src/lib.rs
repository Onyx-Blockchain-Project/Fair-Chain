#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    Address, Env, Vec, Symbol
};

const MAX_SCORE: u32 = 100;
const BASE_REPUTATION: u32 = 100;
const DECAY_RATE_PER_MONTH: u32 = 2;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NoAuditsFound = 1,
    InvalidParameters = 2,
    NotAuthorized = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReputationScore {
    pub factory: Address,
    pub total_score: u32,
    pub auditor_reputation_component: u32,
    pub evidence_depth_component: u32,
    pub recency_component: u32,
    pub category_coverage_component: u32,
    pub last_audit_timestamp: u64,
    pub audit_count: u32,
    pub calculated_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AuditMetadata {
    pub auditor: Address,
    pub auditor_reputation: u32,
    pub evidence_count: u32,
    pub timestamp: u64,
    pub compliance_category: Symbol,
    pub score_delta: i32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    ReputationScore(Address),
    AuditMetadata(u128),
    AuthorizedOracles,
}

#[contract]
pub struct ReputationOracle;

#[contractimpl]
impl ReputationOracle {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);

        let oracles: Vec<Address> = Vec::new(&env);
        env.storage().persistent().set(&DataKey::AuthorizedOracles, &oracles);
    }

    pub fn add_authorized_oracle(env: Env, oracle: Address) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();
        admin.require_auth();

        let mut oracles: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::AuthorizedOracles)
            .unwrap_or(Vec::new(&env));
        
        if !oracles.contains(&oracle) {
            oracles.push_back(oracle);
            env.storage().persistent().set(&DataKey::AuthorizedOracles, &oracles);
        }
    }

    pub fn record_audit_metadata(
        env: Env,
        audit_id: u128,
        auditor: Address,
        auditor_reputation: u32,
        evidence_count: u32,
        timestamp: u64,
        compliance_category: Symbol,
        score_delta: i32,
    ) -> Result<(), Error> {
        let authorized_oracles: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::AuthorizedOracles)
            .unwrap_or(Vec::new(&env));
        
        let caller = env.current_contract_address();
        if !authorized_oracles.contains(&caller) {
            let admin: Address = env
                .storage()
                .instance()
                .get(&DataKey::Admin)
                .unwrap();
            admin.require_auth();
        }

        let metadata = AuditMetadata {
            auditor: auditor.clone(),
            auditor_reputation,
            evidence_count,
            timestamp,
            compliance_category,
            score_delta,
        };

        env.storage().persistent().set(&DataKey::AuditMetadata(audit_id), &metadata);

        env.events().publish(
            (Symbol::new(&env, "metadata_recorded"), audit_id),
            (auditor, evidence_count, timestamp),
        );

        Ok(())
    }

    pub fn calculate_compliance_score(
        env: Env,
        factory: Address,
        audit_ids: Vec<u128>,
    ) -> Result<ReputationScore, Error> {
        if audit_ids.is_empty() {
            return Err(Error::NoAuditsFound);
        }

        let current_time = env.ledger().timestamp();
        
        let mut total_auditor_rep = 0u32;
        let mut total_evidence = 0u32;
        let mut total_recency_weight = 0u32;
        let mut unique_categories: Vec<Symbol> = Vec::new(&env);
        let mut last_audit_time = 0u64;
        let mut total_score_delta = 0i32;

        for audit_id in audit_ids.iter() {
            if let Some(metadata) = env
                .storage()
                .persistent()
                .get::<DataKey, AuditMetadata>(&DataKey::AuditMetadata(audit_id))
            {
                total_auditor_rep += metadata.auditor_reputation;
                total_evidence += metadata.evidence_count;
                total_score_delta += metadata.score_delta;

                let age_in_months = ((current_time - metadata.timestamp) / (30 * 24 * 60 * 60)) as u32;
                let recency_weight = if age_in_months == 0 {
                    100
                } else {
                    100u32.saturating_sub(age_in_months * 10)
                };
                total_recency_weight += recency_weight;

                if !unique_categories.contains(&metadata.compliance_category) {
                    unique_categories.push_back(metadata.compliance_category);
                }

                if metadata.timestamp > last_audit_time {
                    last_audit_time = metadata.timestamp;
                }
            }
        }

        let audit_count = audit_ids.len() as u32;
        if audit_count == 0 {
            return Err(Error::NoAuditsFound);
        }

        let avg_auditor_rep = total_auditor_rep / audit_count;
        let auditor_component = (avg_auditor_rep.min(1000) * 40) / 100;

        let evidence_component = if total_evidence > audit_count * 10 {
            25
        } else if total_evidence > audit_count * 5 {
            15
        } else {
            5
        };

        let avg_recency = total_recency_weight / audit_count;
        let recency_component = (avg_recency * 20) / 100;

        let category_count = unique_categories.len() as u32;
        let category_component = if category_count >= 4 {
            15
        } else if category_count >= 3 {
            10
        } else if category_count >= 2 {
            5
        } else {
            0
        };

        let base_score = auditor_component + evidence_component + recency_component + category_component;
        let adjusted_score = if total_score_delta >= 0 {
            base_score.saturating_add((total_score_delta as u32).min(20))
        } else {
            base_score.saturating_sub((-total_score_delta as u32).min(20))
        };

        let final_score = adjusted_score.min(MAX_SCORE);

        let reputation_score = ReputationScore {
            factory: factory.clone(),
            total_score: final_score,
            auditor_reputation_component: auditor_component,
            evidence_depth_component: evidence_component,
            recency_component,
            category_coverage_component: category_component,
            last_audit_timestamp: last_audit_time,
            audit_count,
            calculated_at: current_time,
        };

        env.storage().persistent().set(&DataKey::ReputationScore(factory.clone()), &reputation_score);

        env.events().publish(
            (Symbol::new(&env, "score_calculated"), factory.clone()),
            (final_score, audit_count, current_time),
        );

        Ok(reputation_score)
    }

    pub fn apply_score_decay(env: Env, factory: Address) -> Result<ReputationScore, Error> {
        let mut score = Self::get_reputation_score(env.clone(), factory.clone())?;
        
        let current_time = env.ledger().timestamp();
        let months_since_last_audit = ((current_time - score.last_audit_timestamp) / (30 * 24 * 60 * 60)) as u32;
        
        if months_since_last_audit > 0 {
            let decay_amount = months_since_last_audit * DECAY_RATE_PER_MONTH;
            score.total_score = score.total_score.saturating_sub(decay_amount);
            score.calculated_at = current_time;
            
            env.storage().persistent().set(&DataKey::ReputationScore(factory.clone()), &score);

            env.events().publish(
                (Symbol::new(&env, "score_decayed"), factory.clone()),
                (decay_amount, score.total_score, current_time),
            );
        }

        Ok(score)
    }

    pub fn get_reputation_score(env: Env, factory: Address) -> Result<ReputationScore, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::ReputationScore(factory))
            .ok_or(Error::NoAuditsFound)
    }

    pub fn is_compliant(env: Env, factory: Address, minimum_score: u32) -> bool {
        if let Ok(score) = Self::get_reputation_score(env.clone(), factory) {
            score.total_score >= minimum_score
        } else {
            false
        }
    }

    pub fn get_component_breakdown(env: Env, factory: Address) -> Result<(u32, u32, u32, u32), Error> {
        let score = Self::get_reputation_score(env, factory)?;
        Ok((
            score.auditor_reputation_component,
            score.evidence_depth_component,
            score.recency_component,
            score.category_coverage_component,
        ))
    }
}
