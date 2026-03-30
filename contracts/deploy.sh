#!/bin/bash
# Contract Deployment Script for FairChain
# This script deploys all FairChain contracts to Stellar testnet

set -e

echo "🚀 FairChain Contract Deployment"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
PASSPHRASE="Test SDF Network ; September 2015"

# Check prerequisites
check_prereqs() {
    echo "📋 Checking prerequisites..."
    
    if ! command -v stellar &> /dev/null; then
        echo -e "${RED}❌ Stellar CLI not found${NC}"
        echo "Install with: cargo install --locked stellar-cli"
        exit 1
    fi
    
    if ! command -v cargo &> /dev/null; then
        echo -e "${RED}❌ Cargo not found${NC}"
        echo "Install Rust from https://rustup.rs"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites met${NC}"
    echo ""
}

# Setup network
setup_network() {
    echo "🌐 Setting up Stellar Testnet..."
    
    stellar config network add testnet \
        --rpc-url "$RPC_URL" \
        --network-passphrase "$PASSPHRASE" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Network configured${NC}"
    echo ""
}

# Build contracts
build_contracts() {
    echo "🔨 Building smart contracts..."
    echo "This may take several minutes on first run..."
    echo ""
    
    cd contracts
    
    for contract in factory_registry auditor_staking audit_nft reputation_oracle rwa_wrapper dispute_resolution; do
        echo "  Building $contract..."
        cd "$contract"
        cargo build --target wasm32-unknown-unknown --release --quiet
        cd ..
    done
    
    cd ..
    
    echo -e "${GREEN}✅ All contracts built${NC}"
    echo ""
}

# Deploy contract function
deploy_contract() {
    local name=$1
    local source_account=$2
    local wasm_path="contracts/$name/target/wasm32-unknown-unknown/release/${name}.wasm"
    
    echo "  🚀 Deploying $name..."
    
    local contract_id=$(stellar contract deploy \
        --wasm "$wasm_path" \
        --source "$source_account" \
        --network "$NETWORK" 2>/dev/null | tail -1)
    
    if [ -z "$contract_id" ]; then
        echo -e "${RED}❌ Failed to deploy $name${NC}"
        return 1
    fi
    
    echo -e "${GREEN}  ✅ $name deployed${NC}"
    echo "     Contract ID: $contract_id"
    
    echo "$contract_id"
}

# Initialize factory_registry
init_factory_registry() {
    local contract_id=$1
    local admin=$2
    local source=$3
    
    echo "  ⚙️  Initializing factory_registry..."
    
    stellar contract invoke \
        --id "$contract_id" \
        --source "$source" \
        --network "$NETWORK" \
        -- \
        initialize \
        --admin "$admin" 2>/dev/null || true
    
    echo -e "${GREEN}  ✅ Initialized${NC}"
}

# Main deployment
main() {
    check_prereqs
    
    # Get account
    echo "🔑 Configure deployment account"
    echo "-------------------------------"
    read -p "Enter your account name (from Stellar CLI): " account_name
    
    # Check if account exists
    if ! stellar keys address "$account_name" &> /dev/null; then
        echo -e "${YELLOW}⚠️  Account '$account_name' not found in Stellar CLI${NC}"
        echo ""
        echo "Add your account first:"
        echo "  stellar keys add $account_name"
        echo ""
        read -p "Press Enter to continue after adding your account..."
    fi
    
    local admin_address=$(stellar keys address "$account_name")
    echo -e "${GREEN}✅ Using account: $admin_address${NC}"
    echo ""
    
    setup_network
    build_contracts
    
    echo ""
    echo "🚀 Deploying Contracts"
    echo "----------------------"
    
    # Deploy contracts
    FACTORY_REGISTRY=$(deploy_contract "factory_registry" "$account_name")
    AUDITOR_STAKING=$(deploy_contract "auditor_staking" "$account_name")
    AUDIT_NFT=$(deploy_contract "audit_nft" "$account_name")
    REPUTATION_ORACLE=$(deploy_contract "reputation_oracle" "$account_name")
    RWA_WRAPPER=$(deploy_contract "rwa_wrapper" "$account_name")
    DISPUTE_RESOLUTION=$(deploy_contract "dispute_resolution" "$account_name")
    
    echo ""
    echo "⚙️  Initializing Contracts"
    echo "-------------------------"
    
    # Initialize contracts
    init_factory_registry "$FACTORY_REGISTRY" "$admin_address" "$account_name"
    
    echo ""
    echo -e "${GREEN}🎉 Deployment Complete!${NC}"
    echo ""
    echo "📋 Contract IDs (save these to backend/.env):"
    echo "--------------------------------------------"
    echo "FACTORY_REGISTRY_CONTRACT_ID=$FACTORY_REGISTRY"
    echo "AUDITOR_STAKING_CONTRACT_ID=$AUDITOR_STAKING"
    echo "AUDIT_NFT_CONTRACT_ID=$AUDIT_NFT"
    echo "REPUTATION_ORACLE_CONTRACT_ID=$REPUTATION_ORACLE"
    echo "RWA_WRAPPER_CONTRACT_ID=$RWA_WRAPPER"
    echo "DISPUTE_RESOLUTION_CONTRACT_ID=$DISPUTE_RESOLUTION"
    echo ""
    
    # Save to file
    cat > contract_ids.txt << EOF
# FairChain Contract IDs - $(date)
# Network: Testnet

FACTORY_REGISTRY_CONTRACT_ID=$FACTORY_REGISTRY
AUDITOR_STAKING_CONTRACT_ID=$AUDITOR_STAKING
AUDIT_NFT_CONTRACT_ID=$AUDIT_NFT
REPUTATION_ORACLE_CONTRACT_ID=$REPUTATION_ORACLE
RWA_WRAPPER_CONTRACT_ID=$RWA_WRAPPER
DISPUTE_RESOLUTION_CONTRACT_ID=$DISPUTE_RESOLUTION

# Admin Address
ADMIN_ADDRESS=$admin_address
EOF
    
    echo "📝 Contract IDs saved to: contract_ids.txt"
    echo ""
    echo "Next steps:"
    echo "  1. Copy these IDs to backend/.env"
    echo "  2. Restart backend server"
    echo ""
}

main "$@"
