import type { AccountCreation, AccountStore, StoredAccount } from "../application/ports.js";

export class UnavailableAccounts implements AccountStore {
  readonly available = false;

  emailInUse(): Promise<boolean> {
    return Promise.resolve(false);
  }

  register(): Promise<AccountCreation> {
    return Promise.reject(new Error("Accounts need a database"));
  }

  findByEmail(): Promise<StoredAccount | null> {
    return Promise.resolve(null);
  }
}
