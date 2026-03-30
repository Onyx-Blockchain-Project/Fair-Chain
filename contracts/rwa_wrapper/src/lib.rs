#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    Address, Env, Symbol, Vec
};

const MIN_COMPLIANCE_SCORE: u32 = 80;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    InsufficientCompliance = 1,
    NotRegistered = 2,
    AlreadyWrapped = 3,
    NotAuthorized = 4,
    InvalidScore = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RWAToken {
    pub token_id: u128,
    pub factory: Address,
    pub compliance_score: u32,
    pub collateral_value: i128,
    pub ltv_ratio: u32,
    pub is_active: bool,
    pub minted_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CollateralTerms {
    pub max_ltv: u32,
    pub interest_rate_basis_points: u32,
    pub min_collateral_value: i128,
}

#[contracttype]
pub enum DataKey {
    Admin,
    RWAToken(Address),
    TokenCounter,
    AuthorizedWrappers,
    BlendPoolAddress,
    CollateralTerms,
}

#[contract]
pub struct RWAWrapper;

#[contractimpl]
impl RWAWrapper {
    pub fn initialize(env: Env, admin: Address, blend_pool: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::BlendPoolAddress, &blend_pool);
        env.storage().instance().set(&DataKey::TokenCounter, &0u128);

        let terms = CollateralTerms {
            max_ltv: 75,
            interest_rate_basis_points: 100,
            min_collateral_value: 100_0000000,
        };
        env.storage().persistent().set(&DataKey::CollateralTerms, &terms);

        let wrappers: Vec<Address> = Vec::new(&env);
        env.storage().persistent().set(&DataKey::AuthorizedWrappers, &wrappers);
    }

    pub fn add_authorized_wrapper(env: Env, wrapper: Address) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();
        admin.require_auth();

        let mut wrappers: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::AuthorizedWrappers)
            .unwrap_or(Vec::new(&env));
        
        if !wrappers.contains(&wrapper) {
            wrappers.push_back(wrapper);
            env.storage().persistent().set(&DataKey::AuthorizedWrappers, &wrappers);
        }
    }

    pub fn update_collateral_terms(
        env: Env,
        max_ltv: u32,
        interest_rate_basis_points: u32,
        min_collateral_value: i128,
    ) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();
        admin.require_auth();

        if max_ltv > 90 || max_ltv < 50 {
            return Err(Error::InvalidScore);
        }

        let terms = CollateralTerms {
            max_ltv,
            interest_rate_basis_points,
            min_collateral_value,
        };
        
        env.storage().persistent().set(&DataKey::CollateralTerms, &terms);

        env.events().publish(
            (Symbol::new(&env, "terms_updated"),),
            (max_ltv, interest_rate_basis_points, min_collateral_value),
        );

        Ok(())
    }

    pub fn wrap_factory(
        env: Env,
        factory: Address,
        compliance_score: u32,
        estimated_value: i128,
    ) -> Result<RWAToken, Error> {
        let authorized_wrappers: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::AuthorizedWrappers)
            .unwrap_or(Vec::new(&env));
        
        let caller = env.current_contract_address();
        if !authorized_wrappers.contains(&caller) {
            let admin: Address = env
                .storage()
                .instance()
                .get(&DataKey::Admin)
                .unwrap();
            admin.require_auth();
        }

        if compliance_score < MIN_COMPLIANCE_SCORE {
            return Err(Error::InsufficientCompliance);
        }

        if env.storage().persistent().has(&DataKey::RWAToken(factory.clone())) {
            return Err(Error::AlreadyWrapped);
        }

        let terms: CollateralTerms = env
            .storage()
            .persistent()
            .get(&DataKey::CollateralTerms)
            .unwrap();

        if estimated_value < terms.min_collateral_value {
            return Err(Error::InvalidScore);
        }

        let token_id = env
            .storage()
            .instance()
            .get::<DataKey, u128>(&DataKey::TokenCounter)
            .unwrap_or(0);
        
        let new_counter = token_id + 1;
        env.storage().instance().set(&DataKey::TokenCounter, &new_counter);

        let ltv_ratio = Self::calculate_ltv(compliance_score, terms.max_ltv);
        let collateral_value = (estimated_value * ltv_ratio as i128) / 100;

        let rwa_token = RWAToken {
            token_id,
            factory: factory.clone(),
            compliance_score,
            collateral_value,
            ltv_ratio,
            is_active: true,
            minted_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::RWAToken(factory.clone()), &rwa_token);

        env.events().publish(
            (Symbol::new(&env, "factory_wrapped"), token_id),
            (factory, compliance_score, collateral_value, ltv_ratio),
        );

        Ok(rwa_token)
    }

    pub fn update_rwa_score(
        env: Env,
        factory: Address,
        new_compliance_score: u32,
    ) -> Result<RWAToken, Error> {
        let authorized_wrappers: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::AuthorizedWrappers)
            .unwrap_or(Vec::new(&env));
        
        let caller = env.current_contract_address();
        if !authorized_wrappers.contains(&caller) {
            let admin: Address = env
                .storage()
                .instance()
                .get(&DataKey::Admin)
                .unwrap();
            admin.require_auth();
        }

        if new_compliance_score < MIN_COMPLIANCE_SCORE {
            return Err(Error::InsufficientCompliance);
        }

        let mut rwa = Self::get_rwa_token(env.clone(), factory.clone())?;
        
        let terms: CollateralTerms = env
            .storage()
            .persistent()
            .get(&DataKey::CollateralTerms)
            .unwrap();

        rwa.compliance_score = new_compliance_score;
        rwa.ltv_ratio = Self::calculate_ltv(new_compliance_score, terms.max_ltv);

        env.storage().persistent().set(&DataKey::RWAToken(factory.clone()), &rwa);

        env.events().publish(
            (Symbol::new(&env, "rwa_updated"), factory.clone()),
            (new_compliance_score, rwa.ltv_ratio, env.ledger().timestamp()),
        );

        Ok(rwa)
    }

    pub fn get_rwa_token(env: Env, factory: Address) -> Result<RWAToken, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::RWAToken(factory))
            .ok_or(Error::NotRegistered)
    }

    pub fn get_collateral_terms(env: Env) -> CollateralTerms {
        env.storage()
            .persistent()
            .get(&DataKey::CollateralTerms)
            .unwrap()
    }

    pub fn is_eligible_for_wrapping(_env: Env, compliance_score: u32) -> bool {
        compliance_score >= MIN_COMPLIANCE_SCORE
    }

    pub fn get_blend_pool(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::BlendPoolAddress)
            .unwrap()
    }

    fn calculate_ltv(compliance_score: u32, max_ltv: u32) -> u32 {
        let base_ltv = if compliance_score >= 90 {
            max_ltv
        } else if compliance_score >= 85 {
            max_ltv - 5
        } else if compliance_score >= 80 {
            max_ltv - 10
        } else {
            50
        };
        
        base_ltv.min(max_ltv).max(50)
    }
}
