// // hardhat.d.ts
// import "hardhat";
// import type { HardhatEthersHelpers } from "@nomicfoundation/hardhat-ethers/types";

// declare module "hardhat/types/runtime" {
//   interface HardhatRuntimeEnvironment {
//     ethers: typeof HardhatEthersHelpers;
//   }
// }
// hardhat.d.ts
import "hardhat/types/runtime";
import type { HardhatEthersHelpers } from "@nomicfoundation/hardhat-ethers/types";

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    ethers: HardhatEthersHelpers;
  }
}
