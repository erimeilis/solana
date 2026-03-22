/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/vault.json`.
 */
export type Vault = {
  "address": "5FejKgQNfWe677DxbEpiyZeoRNyQEZfL1pU7Nixtz7Yh",
  "metadata": {
    "name": "vault",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "deposit",
      "docs": [
        "User deposits SOL into the vault PDA.",
        "A UserAccount PDA tracks how much this specific user deposited."
      ],
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "user",
          "docs": [
            "The user depositing SOL. Must sign the transaction."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "vault",
          "docs": [
            "The vault config account — we update total_deposited."
          ],
          "writable": true
        },
        {
          "name": "userAccount",
          "docs": [
            "Per-user deposit tracker. PDA derived from [\"user\", vault, user_pubkey].",
            "`init_if_needed` = create on first deposit, reuse on subsequent deposits."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "vaultPda",
          "docs": [
            "The vault PDA that holds the actual SOL.",
            "Derived from [\"vault_pda\", vault_pubkey]."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "docs": [
            "Required for creating accounts and transferring SOL via CPI."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "Creates the vault. Whoever calls this becomes the authority.",
        "The vault PDA will hold deposited SOL."
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "vault",
          "docs": [
            "The vault config account — stores authority and total deposits.",
            "`init` = create it now, `payer` = authority pays rent.",
            "`space` = 8 (discriminator) + 32 (Pubkey) + 8 (u64) = 48 bytes."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "docs": [
            "Whoever initializes the vault becomes the authority.",
            "`mut` because they pay for the vault account's rent."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "Required by `init` — the System Program creates the account."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "docs": [
        "User withdraws SOL from the vault PDA back to their wallet.",
        "Can only withdraw up to what they deposited."
      ],
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "user",
          "docs": [
            "The user withdrawing SOL. Must sign the transaction."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "vault",
          "docs": [
            "The vault config account — we update total_deposited."
          ],
          "writable": true
        },
        {
          "name": "userAccount",
          "docs": [
            "Per-user deposit tracker. Must exist (they must have deposited before).",
            "`has_one = owner` verifies that user_account.owner == user.key()."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "vaultPda",
          "docs": [
            "The vault PDA that holds SOL. Same derivation as in Deposit."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "userAccount",
      "discriminator": [
        211,
        33,
        136,
        16,
        186,
        110,
        242,
        127
      ]
    },
    {
      "name": "vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientFunds",
      "msg": "Insufficient funds for withdrawal"
    },
    {
      "code": 6001,
      "name": "invalidAmount",
      "msg": "Amount must be greater than zero"
    },
    {
      "code": 6002,
      "name": "unauthorized",
      "msg": "You are not authorized to perform this action"
    },
    {
      "code": 6003,
      "name": "overflow",
      "msg": "Arithmetic overflow"
    }
  ],
  "types": [
    {
      "name": "userAccount",
      "docs": [
        "Per-user deposit record. One per user per vault. PDA."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "The user who owns this deposit record"
            ],
            "type": "pubkey"
          },
          {
            "name": "deposited",
            "docs": [
              "How much this user has deposited (in lamports)"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "vault",
      "docs": [
        "The vault's config account. One per vault."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Who created the vault"
            ],
            "type": "pubkey"
          },
          {
            "name": "totalDeposited",
            "docs": [
              "Total SOL deposited across all users (in lamports)"
            ],
            "type": "u64"
          }
        ]
      }
    }
  ]
};
