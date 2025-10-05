import "hardhat/types/runtime";
import { HardhatEthersHelpers } from "@nomicfoundation/hardhat-ethers/types";

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    ethers: HardhatEthersHelpers;
  }
}
