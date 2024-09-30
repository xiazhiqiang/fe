import { ALI_NPM_REGISTRY } from "@appworks/constant";
import { exec, execSync } from "child_process";
import fse from "fs-extra";
import { getVersions, isAliNpm } from "ice-npm-utils";
import inquirer from "inquirer";
import _get from "lodash/get";
import minimist from "minimist";
import { join } from "path";

const argv = minimist(process.argv.slice(2));
const rootDir = join(__dirname, "../");
const REGISTRY = "https://registry.npmjs.org/";

// 根目录下的package.json
const pkgJSON = fse.readJSONSync(join(rootDir, "package.json"));

(async () => {
  const packageDirs = getPackagesPaths(
    (pkgJSON.npmPublishDirs || ["packages"]).map((i) => join(rootDir, i))
  );

  let npmTags = [];

  // 发布包
  for (const pkgDir of packageDirs) {
    const ret = await publishPackage(pkgDir);
    ret && npmTags.push(ret);
  }

  // 打 tag
  for (const tag of npmTags) {
    gitTagNpm(tag);
  }
  gitPushTags();

  console.log(`\n执行完毕！\n`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function publishPackage(packageDir) {
  const pkgData = await fse.readJSON(join(packageDir, "package.json"));
  const { version, name } = pkgData;
  const registry = isAliNpm(name)
    ? ALI_NPM_REGISTRY
    : _get(pkgData, "publishConfig.registry", REGISTRY);

  // 含有私有属性的包不需要发布；如果包版本已存在则无需发布
  if (pkgData.private || (await checkVersionExist(name, version, registry))) {
    console.log(`${name}@${version} 已存在，无需发布。`);
    return;
  }

  const { npmTag = "" } = await inquirer.prompt([
    {
      name: "npmTag",
      type: "list",
      choices: [
        {
          name: "无 - 不发布",
          value: "",
        },
        {
          name: "内测版alpha - 用于内部测试",
          value: "alpha",
        },
        {
          name: "公测版beta - 用于外部测试",
          value: "beta",
        },
        {
          name: "预览版rc - 发布前的版本",
          value: "rc",
        },
        {
          name: "最新版latest - 最新正式版本",
          value: "latest",
        },
      ],
      message: `请选择 ${name}@${version} 发布Tag：`,
    },
  ]);

  if (!npmTag) {
    return;
  }

  const branchName = await getGitBranch();
  // const npmTag = tag || (branchName === "master" ? "latest" : "beta");

  const isProdVersion = /^\d+\.\d+\.\d+$/.test(version);
  if (["master", "main"].indexOf(branchName as string) >= 0 && !isProdVersion) {
    console.error(`禁止在 master 分支发布非正式版本：${name}@${version}`);
    return;
  }

  if (["master", "main"].indexOf(branchName as string) < 0 && isProdVersion) {
    console.error(
      `当前 ${branchName} 分支非 master 分支，禁止发布正式版本：${name}@${version}`
    );
    return;
  }

  // console.log(`install ${name} dependencies`);
  // const isInternal = await checkAliInternal();
  // execSync(`${isInternal ? "tnpm" : "npm"} install`, {
  //   cwd: packageDir,
  //   stdio: "inherit",
  // });
  console.log("start publish", version, npmTag);
  execSync(`${isAliNpm(name) ? "tnpm" : "npm"} publish --tag ${npmTag}`, {
    cwd: packageDir,
    stdio: "inherit",
  });

  return { name, version };
}

async function checkVersionExist(
  name: string,
  version: string,
  registry?: string
): Promise<boolean> {
  try {
    const versions = await getVersions(name, registry);
    return versions.indexOf(version) !== -1;
  } catch (err) {
    console.error(
      `${name}@${version} checkVersionExist: ${
        err && err.message ? err.message : "getVersion error"
      }`
    );
    return false;
  }
}

function getPackagesPaths(dirs = []) {
  return (dirs || []).reduce(function (pre, dir) {
    const packagesPaths = fse
      .readdirSync(dir)
      .map((dirname) => {
        return join(dir, dirname);
      })
      .filter((dirPath) => {
        return fse.existsSync(join(dirPath, "package.json"));
      });

    return pre.concat(packagesPaths);
  }, []);
}

async function getGitBranch() {
  return new Promise((resolve) => {
    exec("git rev-parse --abbrev-ref HEAD", (error, stdout, stderr) => {
      if (error) {
        resolve("");
      } else {
        resolve(stdout.toString().trim());
      }
    });
  });
}

function gitTagNpm(opts: { name?: string; version?: string } = {}) {
  if (!opts || !opts.name || !opts.version) {
  }

  const tagName = `${opts.name}@${opts.version}`;
  execSync(`git tag -a '${tagName}' -m '${tagName}'`);
}

function gitPushTags() {
  execSync(`git push --tags`);
}
