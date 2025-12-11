# BiUD — Bitcoin Username Domain (.sBTC)

<div align="center">

```
██████╗ ██╗██╗   ██╗██████╗ 
██╔══██╗██║██║   ██║██╔══██╗
██████╔╝██║██║   ██║██║  ██║
██╔══██╗██║██║   ██║██║  ██║
██████╔╝██║╚██████╔╝██████╔╝
╚═════╝ ╚═╝ ╚═════╝ ╚═════╝ 
```

**Decentralized Username Registrar on Stacks (Bitcoin L2)**

[![Clarity](https://img.shields.io/badge/Clarity-4-blue)](https://clarity-lang.org/)
[![Stacks](https://img.shields.io/badge/Stacks-Bitcoin%20L2-orange)](https://stacks.co/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## 🌟 Overview

BiUD is a decentralized username system similar to ENS but built on **Stacks**, the leading Bitcoin L2. Users can register human-readable names with the `.sBTC` TLD:

- `alice.sBTC`
- `mybrand.sBTC`
- `satoshi.sBTC`

Names are registered, renewed, transferred, and resolved **entirely on-chain** using Clarity smart contracts.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📝 **Name Registration** | Register usernames with `.sBTC` TLD |
| 🔄 **Renewals** | Extend ownership before expiry |
| 🔀 **Transfers** | Transfer names to other principals |
| 🎯 **Resolvers** | Pluggable resolution via traits |
| 💎 **Premium Names** | Short names (≤4 chars) cost more |
| 💰 **Fee Distribution** | Protocol fees to treasury + deployer |
| ⏰ **Expiry System** | Auto-expiry with grace period |
| 🔐 **Admin Governance** | Configurable fees and settings |

---

## 📁 Project Structure

```
biud/
├── Clarinet.toml              # Clarinet configuration
├── contracts/
│   └── biud-username.clar     # Main registry contract
├── tests/
│   └── biud-username_test.ts  # Test suite
├── settings/
│   ├── Devnet.toml            # Development network config
│   ├── Testnet.toml           # Testnet configuration
│   └── Mainnet.toml           # Mainnet configuration
└── frontend/                  # (Optional) Frontend UI
```

---

## 🚀 Quick Start

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) >= 2.0
- Node.js >= 18

### Installation

```bash
# Clone the repository
cd biud

# Check the contract
clarinet check

# Run tests
clarinet test

# Start console for interactive development
clarinet console
```

### Running Tests

```bash
# Run all tests
clarinet test

# Run with verbose output
clarinet test --verbose

# Run specific test file
clarinet test tests/biud-username_test.ts
```

---

## 📖 Contract API

### Core Functions

#### `register-name`
Register a new username with `.sBTC` TLD.

```clarity
(register-name (label (string-utf8 32)))
```

**Parameters:**
- `label`: Username (lowercase a-z, 0-9, hyphen, max 32 chars)

**Returns:** `{ name-id, full-name, expiry-height, fee-paid }`

#### `renew-name`
Extend the registration period for an existing name.

```clarity
(renew-name (label (string-utf8 32)))
```

#### `transfer-name`
Transfer ownership to another principal.

```clarity
(transfer-name (label (string-utf8 32)) (new-owner principal))
```

#### `set-resolver`
Set a resolver contract for custom name resolution.

```clarity
(set-resolver (label (string-utf8 32)) (resolver principal))
```

### Read-Only Functions

| Function | Description |
|----------|-------------|
| `get-name` | Get full name record |
| `is-available` | Check if name is available |
| `get-owner` | Get owner of a name |
| `get-expiry` | Get expiry block height |
| `is-premium-name` | Check if name is premium |
| `get-fee-config` | Get current fee configuration |
| `get-registration-fee` | Calculate fee for a label |
| `get-names-by-owner` | Get all names owned by principal |

### Admin Functions

| Function | Description |
|----------|-------------|
| `set-base-fee` | Update base registration fee |
| `set-renew-fee` | Update renewal fee |
| `set-premium-multiplier` | Update premium price multiplier |
| `set-fee-recipient` | Update fee recipient address |
| `set-premium-label` | Mark a label as premium |
| `set-protocol-treasury` | Update protocol treasury |
| `set-protocol-fee-percent` | Update protocol fee percentage |

---

## 💎 Pricing

### Standard Names (5+ characters)
- **Registration:** 10 STX
- **Renewal:** 5 STX

### Premium Names (1-4 characters)
- **Registration:** 50 STX (5x multiplier)
- **Renewal:** 5 STX

> Admin can mark any name as premium regardless of length.

---

## ⏰ Registration Periods

| Period | Blocks | Duration |
|--------|--------|----------|
| Registration | 52,560 | ~1 year |
| Grace Period | 1,008 | ~7 days |

During the grace period, only the original owner can renew the name.

---

## 🔧 Fee Distribution

Registration and renewal fees are split:

- **90%** → Fee Recipient (deployer by default)
- **10%** → Protocol Treasury

> Configurable by admin via `set-protocol-fee-percent`.

---

## 🔐 Error Codes

| Code | Name | Description |
|------|------|-------------|
| 1001 | `ERR_NAME_TAKEN` | Name already registered |
| 1002 | `ERR_NAME_EXPIRED` | Name has expired |
| 1003 | `ERR_NOT_OWNER` | Caller is not the owner |
| 1004 | `ERR_NOT_ADMIN` | Caller is not admin |
| 1005 | `ERR_INVALID_LABEL` | Invalid label format |
| 1006 | `ERR_PAYMENT_FAILED` | Fee transfer failed |
| 1007 | `ERR_IN_GRACE_PERIOD` | Name is in grace period |
| 1008 | `ERR_RESOLVER_INVALID` | Invalid resolver contract |
| 1009 | `ERR_NAME_NOT_FOUND` | Name does not exist |
| 1010 | `ERR_LABEL_TOO_LONG` | Label exceeds 32 characters |
| 1011 | `ERR_LABEL_EMPTY` | Empty label provided |
| 1012 | `ERR_INVALID_CHARACTER` | Label contains invalid character |
| 1013 | `ERR_TRANSFER_TO_SELF` | Cannot transfer to self |
| 1014 | `ERR_ZERO_FEE` | Fee cannot be zero |

---

## 🎯 Resolver Trait

External contracts can implement the resolver trait for custom resolution:

```clarity
(define-trait resolver-trait
  (
    (resolve ((string-utf8 32) principal) 
             (response (optional (buff 64)) uint))
  )
)
```

### Example Resolver

```clarity
(impl-trait .biud-username.resolver-trait)

(define-public (resolve (label (string-utf8 32)) (owner principal))
  (ok (some 0x1234567890abcdef...))
)
```

---

## 📡 Events

The contract emits events for all major actions:

- `NameRegistered` - New name registered
- `NameRenewed` - Name renewed
- `NameTransferred` - Ownership transferred
- `ResolverSet` - Resolver contract updated
- `FeeConfigUpdated` - Fee settings changed
- `TreasuryUpdated` - Treasury settings changed
- `PremiumLabelSet` - Premium label status changed

---

## 🖥️ Frontend Integration

See the [frontend/](frontend/) directory for a minimal UI outline. Key integrations:

```typescript
// Check availability
const available = await callReadOnly('is-available', [stringUtf8(label)]);

// Register name
const result = await callPublic('register-name', [stringUtf8(label)]);

// Get name info
const nameInfo = await callReadOnly('get-name', [stringUtf8(label)]);
```

---

## 🔒 Security Considerations

1. **Admin Key Security**: The deployer address has admin privileges. Secure this key.
2. **Fee Configuration**: Only admin can modify fees to prevent manipulation.
3. **Grace Period**: Protects users from losing names due to brief lapses.
4. **Resolver Validation**: Resolvers must implement the trait correctly.

---

## 🛣️ Roadmap

- [x] Core registration system
- [x] Premium name pricing
- [x] Fee distribution
- [x] Resolver trait
- [ ] Subdomain support
- [ ] NFT integration
- [ ] Bulk registration
- [ ] Auction system for premium names
- [ ] Cross-chain resolution

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

---

<div align="center">

**Built on Stacks • Secured by Bitcoin**

[Website](https://biud.example.com) • [Discord](https://discord.gg/biud) • [Twitter](https://twitter.com/biud)

</div>
