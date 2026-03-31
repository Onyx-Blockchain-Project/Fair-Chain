#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, 
    Address, Env, String, Symbol, Vec
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyRegistered = 1,
    NotRegistered = 2,
    InvalidInput = 3,
    Unauthorized = 4,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Factory {
    pub owner: Address,
    pub wallet_address: Address,
    pub name: String,
    pub location: String,
    pub product_type: String,
    pub employee_count: u32,
    pub latitude: i64,
    pub longitude: i64,
    pub registered_at: u64,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ProfileNFT {
    pub factory: Address,
    pub token_id: u128,
    pub metadata_hash: String,
    pub minted_at: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Factory(Address),
    ProfileNFT(Address),
    FactoryCount,
    TokenCounter,
    FactoriesByProduct(String),
    FactoriesByRegion(String),
}

#[contract]
pub struct FactoryRegistry;

#[contractimpl]
impl FactoryRegistry {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::FactoryCount, &0u32);
        env.storage().instance().set(&DataKey::TokenCounter, &0u128);
    }

    pub fn register_factory(
        env: Env,
        owner: Address,
        wallet_address: Address,
        name: String,
        location: String,
        product_type: String,
        employee_count: u32,
        latitude: i64,
        longitude: i64,
    ) -> Result<ProfileNFT, Error> {
        owner.require_auth();

        if env.storage().persistent().has(&DataKey::Factory(wallet_address.clone())) {
            return Err(Error::AlreadyRegistered);
        }

        if name.is_empty() || location.is_empty() {
            return Err(Error::InvalidInput);
        }

        let factory = Factory {
            owner: owner.clone(),
            wallet_address: wallet_address.clone(),
            name: name.clone(),
            location: location.clone(),
            product_type: product_type.clone(),
            employee_count,
            latitude,
            longitude,
            registered_at: env.ledger().timestamp(),
            is_active: true,
        };

        env.storage().persistent().set(&DataKey::Factory(wallet_address.clone()), &factory);

        let token_id = env
            .storage()
            .instance()
            .get::<DataKey, u128>(&DataKey::TokenCounter)
            .unwrap_or(0);
        
        let new_counter = token_id + 1;
        env.storage().instance().set(&DataKey::TokenCounter, &new_counter);

        let metadata_hash = Self::generate_metadata_hash(&env, &factory);
        let profile_nft = ProfileNFT {
            factory: wallet_address.clone(),
            token_id,
            metadata_hash,
            minted_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::ProfileNFT(wallet_address.clone()), &profile_nft);

        let mut count = env
            .storage()
            .instance()
            .get::<DataKey, u32>(&DataKey::FactoryCount)
            .unwrap_or(0);
        count += 1;
        env.storage().instance().set(&DataKey::FactoryCount, &count);

        Self::add_to_product_index(&env, product_type.clone(), wallet_address.clone());
        Self::add_to_region_index(&env, location.clone(), wallet_address.clone());

        env.events().publish(
            (Symbol::new(&env, "factory_registered"), wallet_address.clone()),
            (name, product_type, env.ledger().timestamp()),
        );

        Ok(profile_nft)
    }

    pub fn get_factory(env: Env, wallet_address: Address) -> Result<Factory, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Factory(wallet_address))
            .ok_or(Error::NotRegistered)
    }

    pub fn get_profile_nft(env: Env, wallet_address: Address) -> Result<ProfileNFT, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::ProfileNFT(wallet_address))
            .ok_or(Error::NotRegistered)
    }

    pub fn update_factory_status(
        env: Env,
        wallet_address: Address,
        is_active: bool,
    ) -> Result<(), Error> {
        let mut factory = Self::get_factory(env.clone(), wallet_address.clone())?;
        factory.owner.require_auth();
        
        factory.is_active = is_active;
        env.storage().persistent().set(&DataKey::Factory(wallet_address), &factory);
        
        Ok(())
    }

    pub fn get_factories_by_product(env: Env, product_type: String) -> Vec<Address> {
        env.storage()
            .persistent()
            .get(&DataKey::FactoriesByProduct(product_type))
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_factories_by_region(env: Env, region: String) -> Vec<Address> {
        env.storage()
            .persistent()
            .get(&DataKey::FactoriesByRegion(region))
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_factory_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::FactoryCount)
            .unwrap_or(0)
    }

    fn generate_metadata_hash(env: &Env, factory: &Factory) -> String {
        let mut data = Vec::new(env);
        data.push_back(factory.name.clone());
        data.push_back(factory.location.clone());
        data.push_back(factory.product_type.clone());
        
        // Create a simple hash string
        String::from_slice(env, "factory_metadata_hash")
    }

    fn add_to_product_index(env: &Env, product_type: String, factory_address: Address) {
        let key = DataKey::FactoriesByProduct(product_type);
        let mut factories: Vec<Address> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Vec::new(env));
        factories.push_back(factory_address);
        env.storage().persistent().set(&key, &factories);
    }

    fn add_to_region_index(env: &Env, region: String, factory_address: Address) {
        let key = DataKey::FactoriesByRegion(region);
        let mut factories: Vec<Address> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Vec::new(env));
        factories.push_back(factory_address);
        env.storage().persistent().set(&key, &factories);
    }
}
