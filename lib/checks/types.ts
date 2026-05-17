export type CheckStatus = "PASS" | "WARN" | "FAIL";

export type CheckResult = {
  id: string;
  name: string;
  status: CheckStatus;
  message: string;
};

export type CheckContext = {
  owner: string;
  repo: string;
};

export type Check = {
  id: string;
  name: string;
  run: (ctx: CheckContext) => Promise<CheckResult>;
};
