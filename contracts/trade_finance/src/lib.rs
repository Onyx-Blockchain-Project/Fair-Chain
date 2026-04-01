#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    Address, Env, String, Symbol, Vec, token, map
};

const INTEREST_RATE_BPS: u32 = 500; // 5% annual interest
const LOAN_TERM_DAYS: u64 = 90; // 90 days loan term
const MIN_REPUTATION_SCORE: u32 = 60; // Minimum reputation for financing
const COLLATERAL_RATIO: u32 = 150; // 150% collateral ratio

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotAuthorized = 1,
    InsufficientCollateral = 2,
    LowReputationScore = 3,
    LoanNotFound = 4,
    AlreadyActive = 5,
    RepaymentFailed = 6,
    InvalidAmount = 7,
    LoanExpired = 8,
    TransferFailed = 9,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LoanRequest {
    pub id: u128,
    pub factory: Address,
    pub invoice_hash: String,
    pub amount: i128,
    pub collateral_amount: i128,
    pub interest_rate: u32,
    pub term_days: u64,
    pub reputation_score: u32,
    pub status: LoanStatus,
    pub created_at: u64,
    pub due_at: u64,
    pub lender: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LenderPool {
    pub total_liquidity: i128,
    pub active_loans: i128,
    pub interest_earned: i128,
    pub default_rate: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum LoanStatus {
    Pending,
    Active,
    Repaid,
    Defaulted,
    Liquidated,
}

#[contracttype]
pub enum DataKey {
    Admin,
    LoanRequest(u128),
    FactoryLoans(Address),
    LenderLoans(Address),
    LenderPool,
    LoanCounter,
    TokenContract,
    ReputationOracle,
    AuthorizedLenders,
}

#[contract]
pub struct TradeFinance;

#[contractimpl]
impl TradeFinance {
    pub fn initialize(
        env: Env,
        admin: Address,
        token_contract: Address,
        reputation_oracle: Address,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenContract, &token_contract);
        env.storage().instance().set(&DataKey::ReputationOracle, &reputation_oracle);
        env.storage().instance().set(&DataKey::LoanCounter, &0u128);

        let lender_pool = LenderPool {
            total_liquidity: 0,
            active_loans: 0,
            interest_earned: 0,
            default_rate: 0,
        };
        env.storage().instance().set(&DataKey::LenderPool, &lender_pool);

        let authorized_lenders: Vec<Address> = Vec::new(&env);
        env.storage().persistent().set(&DataKey::AuthorizedLenders, &authorized_lenders);
    }

    pub fn add_authorized_lender(env: Env, lender: Address) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();
        admin.require_auth();

        let mut authorized_lenders: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::AuthorizedLenders)
            .unwrap_or(Vec::new(&env));
        
        if !authorized_lenders.contains(&lender) {
            authorized_lenders.push_back(lender);
            env.storage().persistent().set(&DataKey::AuthorizedLenders, &authorized_lenders);
        }
    }

    pub fn request_loan(
        env: Env,
        factory: Address,
        invoice_hash: String,
        amount: i128,
    ) -> Result<u128, Error> {
        factory.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        // Check factory reputation
        let reputation_oracle: Address = env
            .storage()
            .instance()
            .get(&DataKey::ReputationOracle)
            .unwrap();
        
        // This would normally call the reputation oracle contract
        // For now, we'll use a placeholder check
        let reputation_score = Self::get_factory_reputation(&env, factory.clone())?;
        
        if reputation_score < MIN_REPUTATION_SCORE {
            return Err(Error::LowReputationScore);
        }

        let collateral_amount = (amount * COLLATERAL_RATIO as i128) / 100;
        
        let loan_id = env
            .storage()
            .instance()
            .get::<DataKey, u128>(&DataKey::LoanCounter)
            .unwrap_or(0);
        
        let new_counter = loan_id + 1;
        env.storage().instance().set(&DataKey::LoanCounter, &new_counter);

        let current_time = env.ledger().timestamp();
        let due_at = current_time + (LOAN_TERM_DAYS * 24 * 60 * 60);

        let loan_request = LoanRequest {
            id: loan_id,
            factory: factory.clone(),
            invoice_hash,
            amount,
            collateral_amount,
            interest_rate: INTEREST_RATE_BPS,
            term_days: LOAN_TERM_DAYS,
            reputation_score,
            status: LoanStatus::Pending,
            created_at: current_time,
            due_at,
            lender: Address::zero(&env),
        };

        env.storage().persistent().set(&DataKey::LoanRequest(loan_id), &loan_request);

        // Add to factory's loans
        let factory_loans_key = DataKey::FactoryLoans(factory.clone());
        let mut factory_loans: Vec<u128> = env
            .storage()
            .persistent()
            .get(&factory_loans_key)
            .unwrap_or(Vec::new(&env));
        factory_loans.push_back(loan_id);
        env.storage().persistent().set(&factory_loans_key, &factory_loans);

        env.events().publish(
            (Symbol::new(&env, "loan_requested"), loan_id),
            (factory, amount, reputation_score),
        );

        Ok(loan_id)
    }

    pub fn approve_loan(
        env: Env,
        loan_id: u128,
        lender: Address,
    ) -> Result<(), Error> {
        lender.require_auth();

        let authorized_lenders: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::AuthorizedLenders)
            .unwrap_or(Vec::new(&env));
        
        if !authorized_lenders.contains(&lender) {
            return Err(Error::NotAuthorized);
        }

        let mut loan = Self::get_loan_request(env.clone(), loan_id)?;
        
        if !matches!(loan.status, LoanStatus::Pending) {
            return Err(Error::AlreadyActive);
        }

        // Transfer funds from lender to factory
        let token_client = token::Client::new(&env, &env
            .storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::TokenContract)
            .unwrap());

        let transfer_result = token_client.try_transfer(&lender, &loan.factory, &loan.amount);
        if transfer_result.is_err() {
            return Err(Error::TransferFailed);
        }

        // Lock collateral from factory
        let collateral_result = token_client.try_transfer(&loan.factory, &env.current_contract_address(), &loan.collateral_amount);
        if collateral_result.is_err() {
            return Err(Error::InsufficientCollateral);
        }

        loan.status = LoanStatus::Active;
        loan.lender = lender.clone();

        env.storage().persistent().set(&DataKey::LoanRequest(loan_id), &loan);

        // Add to lender's loans
        let lender_loans_key = DataKey::LenderLoans(lender.clone());
        let mut lender_loans: Vec<u128> = env
            .storage()
            .persistent()
            .get(&lender_loans_key)
            .unwrap_or(Vec::new(&env));
        lender_loans.push_back(loan_id);
        env.storage().persistent().set(&lender_loans_key, &lender_loans);

        // Update lender pool
        let mut pool = Self::get_lender_pool(env.clone())?;
        pool.active_loans += loan.amount;
        env.storage().instance().set(&DataKey::LenderPool, &pool);

        env.events().publish(
            (Symbol::new(&env, "loan_approved"), loan_id),
            (lender, loan.factory, loan.amount),
        );

        Ok(())
    }

    pub fn repay_loan(
        env: Env,
        loan_id: u128,
    ) -> Result<(), Error> {
        let mut loan = Self::get_loan_request(env.clone(), loan_id)?;
        
        if !matches!(loan.status, LoanStatus::Active) {
            return Err(Error::LoanNotFound);
        }

        let current_time = env.ledger().timestamp();
        if current_time > loan.due_at {
            return Err(Error::LoanExpired);
        }

        let interest_amount = (loan.amount * loan.interest_rate as i128) / 10000;
        let total_repayment = loan.amount + interest_amount;

        // Transfer repayment from factory to lender
        let token_client = token::Client::new(&env, &env
            .storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::TokenContract)
            .unwrap());

        let transfer_result = token_client.try_transfer(&loan.factory, &loan.lender, &total_repayment);
        if transfer_result.is_err() {
            return Err(Error::RepaymentFailed);
        }

        // Return collateral to factory
        token_client.transfer(&env.current_contract_address(), &loan.factory, &loan.collateral_amount);

        loan.status = LoanStatus::Repaid;
        env.storage().persistent().set(&DataKey::LoanRequest(loan_id), &loan);

        // Update lender pool
        let mut pool = Self::get_lender_pool(env.clone())?;
        pool.active_loans -= loan.amount;
        pool.interest_earned += interest_amount;
        env.storage().instance().set(&DataKey::LenderPool, &pool);

        env.events().publish(
            (Symbol::new(&env, "loan_repaid"), loan_id),
            (loan.factory, total_repayment, current_time),
        );

        Ok(())
    }

    pub fn liquidate_loan(
        env: Env,
        loan_id: u128,
    ) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();
        admin.require_auth();

        let mut loan = Self::get_loan_request(env.clone(), loan_id)?;
        
        if !matches!(loan.status, LoanStatus::Active) {
            return Err(Error::LoanNotFound);
        }

        let current_time = env.ledger().timestamp();
        if current_time <= loan.due_at {
            return Err(Error::LoanExpired);
        }

        // Transfer collateral to lender
        let token_client = token::Client::new(&env, &env
            .storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::TokenContract)
            .unwrap());

        token_client.transfer(&env.current_contract_address(), &loan.lender, &loan.collateral_amount);

        loan.status = LoanStatus::Liquidated;
        env.storage().persistent().set(&DataKey::LoanRequest(loan_id), &loan);

        // Update lender pool
        let mut pool = Self::get_lender_pool(env.clone())?;
        pool.active_loans -= loan.amount;
        env.storage().instance().set(&DataKey::LenderPool, &pool);

        env.events().publish(
            (Symbol::new(&env, "loan_liquidated"), loan_id),
            (loan.factory, loan.lender, loan.collateral_amount),
        );

        Ok(())
    }

    pub fn get_loan_request(env: Env, loan_id: u128) -> Result<LoanRequest, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::LoanRequest(loan_id))
            .ok_or(Error::LoanNotFound)
    }

    pub fn get_factory_loans(env: Env, factory: Address) -> Vec<u128> {
        env.storage()
            .persistent()
            .get(&DataKey::FactoryLoans(factory))
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_lender_loans(env: Env, lender: Address) -> Vec<u128> {
        env.storage()
            .persistent()
            .get(&DataKey::LenderLoans(lender))
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_lender_pool(env: Env) -> Result<LenderPool, Error> {
        env.storage()
            .instance()
            .get(&DataKey::LenderPool)
            .ok_or(Error::LoanNotFound)
    }

    pub fn is_eligible_for_loan(env: Env, factory: Address, amount: i128) -> Result<bool, Error> {
        let reputation_score = Self::get_factory_reputation(&env, factory.clone())?;
        let has_active_loans = Self::has_active_loans(&env, factory.clone())?;
        
        Ok(
            reputation_score >= MIN_REPUTATION_SCORE &&
            amount > 0 &&
            !has_active_loans
        )
    }

    fn get_factory_reputation(env: &Env, factory: Address) -> Result<u32, Error> {
        // This would normally call the reputation oracle contract
        // For demonstration, return a placeholder value
        Ok(75) // Placeholder reputation score
    }

    fn has_active_loans(env: &Env, factory: Address) -> Result<bool, Error> {
        let factory_loans: Vec<u128> = env
            .storage()
            .persistent()
            .get(&DataKey::FactoryLoans(factory))
            .unwrap_or(Vec::new(env));

        for loan_id in factory_loans.iter() {
            if let Some(loan) = env
                .storage()
                .persistent()
                .get::<DataKey, LoanRequest>(&DataKey::LoanRequest(*loan_id))
            {
                if matches!(loan.status, LoanStatus::Active) {
                    return Ok(true);
                }
            }
        }

        Ok(false)
    }
}
