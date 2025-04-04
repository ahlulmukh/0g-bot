import chalk from "chalk";
import fs from "fs";
import { ogBot } from "./classes/ogbot";
import { getRandomProxy, loadProxies } from "./classes/proxy";
import { logMessage, prompt } from "./utils/logger";
let totalTransactionGlobal: number | null = null;

async function main(): Promise<void> {
  console.log(
    chalk.cyan(`
░▄▀▄░█▀▀░░░░░█▀▄░█▀█░▀█▀
░█/█░█░█░▄▄▄░█▀▄░█░█░░█░
░░▀░░▀▀▀░░░░░▀▀░░▀▀▀░░▀░
  By : El Puqus Airdrop
   github.com/ahlulmukh
 Use it at your own risk
  `)
  );

  if (totalTransactionGlobal === null) {
    const totalTransactionInput = parseInt(await prompt(chalk.yellow("Total transaction perday? ")));
    totalTransactionGlobal = totalTransactionInput;

    if (isNaN(totalTransactionGlobal) || totalTransactionGlobal <= 0) {
      console.log(chalk.red("Input not valid. Please input a number greater than 0."));
      process.exit(1);
    }
  }

  const accounts = fs
    .readFileSync("privatekey.txt", "utf8")
    .split("\n")
    .filter(Boolean);
  const count = accounts.length;

  const proxiesLoaded = loadProxies();
  if (!proxiesLoaded) {
    logMessage(null, null, "No Proxy. Using default IP", "warning");
  }

  let successful = 0;

  for (let i = 0; i < count; i++) {
    console.log(chalk.white("-".repeat(85)));
    logMessage(i + 1, count, "Processing Transaction", "process");
    const privkey = accounts[i];
    const currentProxy = await getRandomProxy(i + 1, count);
    const og = new ogBot(privkey, currentProxy, i + 1, count);

    try {
      let txCount = 0;
      while (txCount < totalTransactionGlobal) {
        logMessage(i + 1, count, `Total Transaction: ${txCount + 1}/${totalTransactionGlobal}`, "info");
        await og.autoSwapBtcUsdt();
        await og.autoSwapEthUsdt();
        txCount++;
      }

      successful++;
    } catch (err) {
      logMessage(i + 1, count, `Error: ${(err as any).message}`, "error");
    }
  }

  console.log(chalk.white("-".repeat(85)));
  const now = new Date();
  const targetTime = new Date(now);
  targetTime.setHours(12, 0, 0, 0);

  if (now > targetTime) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const sleepTime = targetTime.getTime() - now.getTime();
  logMessage(null, null, `Sleeping until ${targetTime.toISOString()}...`, "success");
  await new Promise(resolve => setTimeout(resolve, sleepTime));

  main();
}

main().catch((err) => {
  console.error(chalk.red("Error occurred:"), err);
  process.exit(1);
});