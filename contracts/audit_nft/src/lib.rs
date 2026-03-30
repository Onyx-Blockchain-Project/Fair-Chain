#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    Address, Env, String, Symbol, Vec
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotAuthorized = 1,
    InvalidEvidence = 2,
    AuditNotFound = 3,
    AlreadyDisputed = 4,
    InvalidScore = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AuditNFT {
    pub token_id: u128,
    pub factory: Address,
    pub auditor: Address,
    pub ipfs_hashes: Vec<String>,
    pub compliance_category: String,
    pub score_delta: i32,
    pub timestamp: u64,
    pub geolocation: String,
    pub is_active: bool,
    pub dispute_count: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ComplianceCategory {
    pub category: String,
    pub weight: u32,
    pub expiration_months: u32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    AuditNFT(u128),
    FactoryAudits(Address),
    AuditorAudits(Address),
    TokenCounter,
    AuthorizedMinters,
    ComplianceCategories,
}

#[contract]
pub struct AuditNFTContract;

#[contractimpl]
impl AuditNFTContract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenCounter, &0u128);

        let categories = Self::init_compliance_categories(&env);
        env.storage().persistent().set(&DataKey::ComplianceCategories, &categories);

        let minters: Vec<Address> = Vec::new(&env);
        env.storage().persistent().set(&DataKey::AuthorizedMinters, &minters);
    }

    pub fn add_authorized_minter(env: Env, minter: Address) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();
        admin.require_auth();

        let mut minters: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::AuthorizedMinters)
            .unwrap_or(Vec::new(&env));
        
        if !minters.contains(&minter) {
            minters.push_back(minter);
            env.storage().persistent().set(&DataKey::AuthorizedMinters, &minters);
        }
    }

    pub fn mint_audit(
        env: Env,
        factory: Address,
        auditor: Address,
        ipfs_hashes: Vec<String>,
        compliance_category: String,
        score_delta: i32,
        geolocation: String,
    ) -> Result<AuditNFT, Error> {
        let authorized_minters: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::AuthorizedMinters)
            .unwrap_or(Vec::new(&env));
        
        if !authorized_minters.contains(&env.current_contract_address()) {
            auditor.require_auth();
        }

        if ipfs_hashes.is_empty() {
            return Err(Error::InvalidEvidence);
        }

        if score_delta < -50 || score_delta > 50 {
            return Err(Error::InvalidScore);
        }

        let token_id = env
            .storage()
            .instance()
            .get::<DataKey, u128>(&DataKey::TokenCounter)
            .unwrap_or(0);
        
        let new_counter = token_id + 1;
        env.storage().instance().set(&DataKey::TokenCounter, &new_counter);

        let audit_nft = AuditNFT {
            token_id,
            factory: factory.clone(),
            auditor: auditor.clone(),
            ipfs_hashes,
            compliance_category: compliance_category.clone(),
            score_delta,
            timestamp: env.ledger().timestamp(),
            geolocation,
            is_active: true,
            dispute_count: 0,
        };

        env.storage().persistent().set(&DataKey::AuditNFT(token_id), &audit_nft);

        let factory_audits_key = DataKey::FactoryAudits(factory.clone());
        let mut factory_audits: Vec<u128> = env
            .storage()
            .persistent()
            .get(&factory_audits_key)
            .unwrap_or(Vec::new(&env));
        factory_audits.push_back(token_id);
        env.storage().persistent().set(&factory_audits_key, &factory_audits);

        let auditor_audits_key = DataKey::AuditorAudits(auditor.clone());
        let mut auditor_audits: Vec<u128> = env
            .storage()
            .persistent()
            .get(&auditor_audits_key)
            .unwrap_or(Vec::new(&env));
        auditor_audits.push_back(token_id);
        env.storage().persistent().set(&auditor_audits_key, &auditor_audits);

        env.events().publish(
            (Symbol::new(&env, "audit_minted"), token_id),
            (factory, auditor, compliance_category, score_delta),
        );

        Ok(audit_nft)
    }

    pub fn get_audit(env: Env, token_id: u128) -> Result<AuditNFT, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::AuditNFT(token_id))
            .ok_or(Error::AuditNotFound)
    }

    pub fn get_factory_audits(env: Env, factory: Address) -> Vec<u128> {
        env.storage()
            .persistent()
            .get(&DataKey::FactoryAudits(factory))
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_auditor_audits(env: Env, auditor: Address) -> Vec<u128> {
        env.storage()
            .persistent()
            .get(&DataKey::AuditorAudits(auditor))
            .unwrap_or(Vec::new(&env))
    }

    pub fn update_audit_status(
        env: Env,
        token_id: u128,
        is_active: bool,
    ) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();
        admin.require_auth();

        let mut audit = Self::get_audit(env.clone(), token_id)?;
        audit.is_active = is_active;
        
        env.storage().persistent().set(&DataKey::AuditNFT(token_id), &audit);

        Ok(())
    }

    pub fn record_dispute(env: Env, token_id: u128) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();
        admin.require_auth();

        let mut audit = Self::get_audit(env.clone(), token_id)?;
        audit.dispute_count += 1;
        
        env.storage().persistent().set(&DataKey::AuditNFT(token_id), &audit);

        env.events().publish(
            (Symbol::new(&env, "audit_disputed"), token_id),
            audit.dispute_count,
        );

        Ok(())
    }

    pub fn get_audit_count(env: Env) -> u128 {
        env.storage()
            .instance()
            .get::<DataKey, u128>(&DataKey::TokenCounter)
            .unwrap_or(0)
    }

    pub fn is_audit_expired(env: Env, token_id: u128) -> Result<bool, Error> {
        let audit = Self::get_audit(env.clone(), token_id)?;
        let categories: Vec<ComplianceCategory> = env
            .storage()
            .persistent()
            .get(&DataKey::ComplianceCategories)
            .unwrap();

        let current_time = env.ledger().timestamp();
        let audit_age_months = (current_time - audit.timestamp) / (30 * 24 * 60 * 60);

        for category in categories.iter() {
            if category.category == audit.compliance_category {
                return Ok(audit_age_months > category.expiration_months as u64);
            }
        }

        Ok(false)
    }

    fn init_compliance_categories(env: &Env) -> Vec<ComplianceCategory> {
        let mut categories = Vec::new(env);
        
        categories.push_back(ComplianceCategory {
            category: String::from_str(env, "labor"),
            weight: 40,
            expiration_months: 12,
        });
        
        categories.push_back(ComplianceCategory {
            category: String::from_str(env, "environmental"),
            weight: 25,
            expiration_months: 6,
        });
        
        categories.push_back(ComplianceCategory {
            category: String::from_str(env, "quality"),
            weight: 20,
            expiration_months: 3,
        });
        
        categories.push_back(ComplianceCategory {
            category: String::from_str(env, "safety"),
            weight: 15,
            expiration_months: 12,
        });

        categories
    }
}
