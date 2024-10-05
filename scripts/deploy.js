const { ethers, run, network } = require("hardhat");

async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying Contract...");
  const simpleStorage = await SimpleStorageFactory.deploy();
  const address = await simpleStorage.getAddress();
  console.log(`Contract deployed at address: ${address}`);

  if (network.config.chainId === "11155111" && process.env.ETHERSCAN_API_KEY) {
    console.log("Wating for block confirmation...");
    await simpleStorage.deploymentTransaction().wait(6);
    await verify(address, []);
  }

  const currentValue = await simpleStorage.retrieve();
  console.log(`Current Value is ${currentValue}`);

  const transactionResponse = await simpleStorage.store("7");
  await transactionResponse.wait(1);
  const updateFavoriteNumber = await simpleStorage.retrieve();
  console.log(`Updated Favorite Number: ${updateFavoriteNumber}`);
}

async function verify(contractAddress, args) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified");
    } else {
      console.log(error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
