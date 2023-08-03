"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Project: () => Project
});
module.exports = __toCommonJS(src_exports);
var import_fixturify = __toESM(require("fixturify"), 1);
var import_tmp = __toESM(require("tmp"), 1);
var import_fs_extra = __toESM(require("fs-extra"), 1);
var import_path = __toESM(require("path"), 1);
var import_resolve_package_path = __toESM(require("resolve-package-path"), 1);
var import_cache_group = __toESM(require("resolve-package-path/lib/cache-group.js"), 1);
var import_bin_links = __toESM(require("bin-links"), 1);
var import_walk_sync = __toESM(require("walk-sync"), 1);
var import_util = require("util");
var import_deepmerge = __toESM(require("deepmerge"), 1);
var { entries } = import_walk_sync.default;
import_tmp.default.setGracefulCleanup();
var defaultFiles = {
  "index.js": `
    'use strict';
     module.exports = {};`
};
var Project = class {
  constructor(first, second, third, fourth) {
    this.isDependency = true;
    this._dependencies = {};
    this._devDependencies = {};
    this.dependencyLinks = /* @__PURE__ */ new Map();
    this.linkIsDevDependency = /* @__PURE__ */ new Set();
    this.usingHardLinks = true;
    this.resolutionCache = new import_cache_group.default();
    let name;
    let version;
    let files;
    let requestedRange;
    if (first == null) {
    } else if (typeof first === "string") {
      name = first;
      if (typeof second === "string") {
        version = second;
        if (third) {
          if (!isProjectCallback(third)) {
            ({ files, requestedRange } = third);
          }
        }
      } else {
        if (second) {
          if (!isProjectCallback(second)) {
            ({ version, files, requestedRange } = second);
          }
        }
      }
    } else {
      ({ name, version, files, requestedRange } = first);
    }
    let pkg = {};
    if (files && typeof (files == null ? void 0 : files["package.json"]) === "string") {
      pkg = JSON.parse(files["package.json"]);
      files = Object.assign({}, files);
      delete files["package.json"];
    }
    this.pkg = Object.assign({}, pkg, {
      name: name || pkg.name || "a-fixturified-project",
      version: version || pkg.version || "0.0.0",
      keywords: pkg.keywords || []
    });
    if (files) {
      this.files = { ...defaultFiles, ...files };
    } else {
      this.files = defaultFiles;
    }
    this.requestedRange = requestedRange || this.pkg.version;
    const arity = arguments.length;
    if (arity > 1) {
      fourth;
      const projectCallback = arguments[arity - 1];
      if (isProjectCallback(projectCallback)) {
        projectCallback(this);
      }
    }
  }
  get root() {
    throw new Error(".root has been removed, please review the readme but you likely actually want .baseDir now");
  }
  set baseDir(dir) {
    if (this._baseDir) {
      throw new Error(`this Project already has a baseDir`);
    }
    this._baseDir = dir;
  }
  get baseDir() {
    if (!this._baseDir) {
      this._tmp = import_tmp.default.dirSync({ unsafeCleanup: true });
      this._baseDir = import_fs_extra.default.realpathSync(this._tmp.name);
    }
    return this._baseDir;
  }
  get name() {
    return getPackageName(this.pkg);
  }
  set name(value) {
    this.pkg.name = value;
  }
  get version() {
    return getPackageVersion(this.pkg);
  }
  set version(value) {
    this.pkg.version = value;
  }
  static fromDir(root, opts) {
    let project = new Project();
    project.readSync(root, opts);
    return project;
  }
  mergeFiles(dirJSON) {
    this.files = (0, import_deepmerge.default)(this.files, dirJSON);
  }
  async write(dirJSON) {
    if (dirJSON) {
      this.mergeFiles(dirJSON);
    }
    this.writeProject();
    await this.binLinks();
  }
  writeSync() {
    this.writeProject();
  }
  addDependency(first, second, third, fourth) {
    let projectCallback;
    const arity = arguments.length;
    if (arity > 1) {
      fourth;
      const maybeProjectCallback = arguments[arity - 1];
      if (isProjectCallback(maybeProjectCallback)) {
        projectCallback = maybeProjectCallback;
      }
    }
    if (isProjectCallback(second)) {
      second = void 0;
    }
    if (isProjectCallback(third)) {
      third = void 0;
    }
    return this.addDep(first, second, third, "_dependencies", projectCallback);
  }
  addDevDependency(first, second, third, fourth) {
    let projectCallback;
    const arity = arguments.length;
    if (arity > 1) {
      fourth;
      const maybeProjectCallback = arguments[arity - 1];
      if (isProjectCallback(maybeProjectCallback)) {
        projectCallback = maybeProjectCallback;
      }
    }
    if (isProjectCallback(second)) {
      second = void 0;
    }
    if (isProjectCallback(third)) {
      third = void 0;
    }
    return this.addDep(first, second, third, "_devDependencies", projectCallback);
  }
  removeDependency(name) {
    delete this._dependencies[name];
    this.dependencyLinks.delete(name);
    this.linkIsDevDependency.delete(name);
  }
  removeDevDependency(name) {
    delete this._devDependencies[name];
    this.dependencyLinks.delete(name);
    this.linkIsDevDependency.delete(name);
  }
  linkDependency(name, opts) {
    this.removeDependency(name);
    this.removeDevDependency(name);
    this.dependencyLinks.set(name, opts);
  }
  linkDevDependency(name, opts) {
    this.linkDependency(name, opts);
    this.linkIsDevDependency.add(name);
  }
  dependencyProjects() {
    return Object.keys(this._dependencies).map((dependency) => this._dependencies[dependency]);
  }
  devDependencyProjects() {
    return Object.keys(this._devDependencies).map((dependency) => this._devDependencies[dependency]);
  }
  clone() {
    let cloned = new this.constructor();
    cloned.pkg = JSON.parse(JSON.stringify(this.pkg));
    cloned.files = JSON.parse(JSON.stringify(this.files));
    for (let [name, depProject] of Object.entries(this._dependencies)) {
      cloned._dependencies[name] = depProject.clone();
    }
    for (let [name, depProject] of Object.entries(this._devDependencies)) {
      cloned._devDependencies[name] = depProject.clone();
    }
    cloned.dependencyLinks = new Map(this.dependencyLinks);
    cloned.linkIsDevDependency = new Set(this.linkIsDevDependency);
    cloned.requestedRange = this.requestedRange;
    return cloned;
  }
  dispose() {
    if (this._tmp) {
      this._tmp.removeCallback();
    }
  }
  writeProject() {
    this.assignBaseDirs();
    let resolvedLinksMap = /* @__PURE__ */ new Map();
    this.writeFiles(resolvedLinksMap);
    this.finalizeWrite(resolvedLinksMap);
  }
  assignBaseDirs() {
    this.baseDir;
    for (let depList of [this.dependencyProjects(), this.devDependencyProjects()]) {
      for (let dep of depList) {
        dep.baseDir = import_path.default.join(this.baseDir, "node_modules", dep.name);
        dep.assignBaseDirs();
      }
    }
  }
  writeFiles(resolvedLinksMap) {
    import_fixturify.default.writeSync(this.baseDir, this.files);
    for (let depList of [this.dependencyProjects(), this.devDependencyProjects()]) {
      for (let dep of depList) {
        dep.writeFiles(resolvedLinksMap);
      }
    }
    let resolvedLinks = this.resolveLinks();
    import_fs_extra.default.outputJSONSync(import_path.default.join(this.baseDir, "package.json"), this.pkgJSONWithDeps(resolvedLinks), { spaces: 2 });
    resolvedLinksMap.set(this, resolvedLinks);
  }
  finalizeWrite(resolvedLinksMap) {
    for (let [name, { dir: target }] of resolvedLinksMap.get(this)) {
      this.writeLinkedPackage(name, target, import_path.default.join(this.baseDir, "node_modules", name));
    }
    for (let depList of [this.dependencyProjects(), this.devDependencyProjects()]) {
      for (let dep of depList) {
        dep.finalizeWrite(resolvedLinksMap);
      }
    }
  }
  resolveLinks() {
    return new Map(
      [...this.dependencyLinks.entries()].map(([name, opts]) => {
        let dir;
        if ("baseDir" in opts) {
          let pkgJSONPath = (0, import_resolve_package_path.default)(opts.resolveName || name, opts.baseDir, this.resolutionCache);
          if (!pkgJSONPath) {
            throw new Error(`failed to locate ${opts.resolveName || name} in ${opts.baseDir}`);
          }
          dir = import_path.default.dirname(pkgJSONPath);
        } else if ("target" in opts) {
          dir = opts.target;
        } else {
          dir = opts.project.baseDir;
        }
        let requestedRange;
        if (opts.requestedRange) {
          requestedRange = opts.requestedRange;
        } else if ("target" in opts || "baseDir" in opts) {
          requestedRange = import_fs_extra.default.readJsonSync(import_path.default.join(dir, "package.json")).version;
        } else {
          requestedRange = opts.project.version;
        }
        return [name, { requestedRange, dir }];
      })
    );
  }
  async binLinks() {
    let nodeModules = import_path.default.join(this.baseDir, "node_modules");
    for (const { pkg, path: path2 } of readPackages(nodeModules)) {
      await (0, import_bin_links.default)({ pkg, path: path2, top: false, global: false, force: true });
    }
  }
  writeLinkedPackage(name, target, destination) {
    var _a;
    let targetPkg = import_fs_extra.default.readJsonSync(`${target}/package.json`);
    let peers = new Set(Object.keys((_a = targetPkg.peerDependencies) != null ? _a : {}));
    if (peers.size === 0) {
      import_fs_extra.default.ensureSymlinkSync(target, destination, "dir");
      return;
    }
    this.hardLinkContents(target, destination);
    for (let section of ["dependencies", "peerDependencies"]) {
      if (targetPkg[section]) {
        for (let depName of Object.keys(targetPkg[section])) {
          if (peers.has(depName)) {
            continue;
          }
          let depTarget = (0, import_resolve_package_path.default)(depName, target, this.resolutionCache);
          if (!depTarget) {
            throw new Error(
              `[FixturifyProject] package ${name} in ${target} depends on ${depName} but we could not resolve it`
            );
          }
          this.writeLinkedPackage(depName, import_path.default.dirname(depTarget), import_path.default.join(destination, "node_modules", depName));
        }
      }
    }
  }
  hardLinkContents(target, destination) {
    import_fs_extra.default.ensureDirSync(destination);
    for (let entry of entries(target, { ignore: ["node_modules"] })) {
      if (entry.isDirectory()) {
        import_fs_extra.default.ensureDirSync(import_path.default.join(destination, entry.relativePath));
      } else {
        this.hardLinkFile(entry.fullPath, import_path.default.join(destination, entry.relativePath));
      }
    }
  }
  hardLinkFile(source, destination) {
    if (this.usingHardLinks) {
      try {
        import_fs_extra.default.linkSync(source, destination);
        return;
      } catch (err) {
        if (err.code !== "EXDEV") {
          throw err;
        }
        this.usingHardLinks = false;
      }
    }
    import_fs_extra.default.copyFileSync(source, destination, import_fs_extra.default.constants.COPYFILE_FICLONE | import_fs_extra.default.constants.COPYFILE_EXCL);
  }
  readSync(root, opts) {
    const files = import_fixturify.default.readSync(root, {
      ignore: (opts == null ? void 0 : opts.linkDeps) || (opts == null ? void 0 : opts.linkDevDeps) ? ["node_modules"] : []
    });
    this.pkg = deserializePackageJson(getFile(files, "package.json"));
    this.requestedRange = this.version;
    delete files["package.json"];
    this.files = files;
    if ((opts == null ? void 0 : opts.linkDeps) || (opts == null ? void 0 : opts.linkDevDeps)) {
      if (this.pkg.dependencies) {
        for (let dep of Object.keys(this.pkg.dependencies)) {
          this.linkDependency(dep, { baseDir: root });
        }
      }
      if (this.pkg.devDependencies && opts.linkDevDeps) {
        for (let dep of Object.keys(this.pkg.devDependencies)) {
          this.linkDevDependency(dep, { baseDir: root });
        }
      }
    } else {
      const nodeModules = getFolder(files, "node_modules");
      delete files["node_modules"];
      keys(this.pkg.dependencies).forEach((dependency) => {
        this.addDependency(
          new this.constructor({ files: unwrapPackageName(nodeModules, dependency) })
        );
      });
      keys(this.pkg.devDependencies).forEach((dependency) => {
        this.addDevDependency(
          new this.constructor({ files: unwrapPackageName(nodeModules, dependency) })
        );
      });
    }
  }
  addDep(first, second, third, target, projectCallback) {
    let dep;
    if (first == null) {
      dep = new Project();
    } else if (typeof first === "string") {
      let name = first;
      if (typeof second === "string") {
        let version = second;
        dep = new Project(name, version, third, projectCallback);
      } else {
        dep = new Project(name, second, projectCallback);
      }
    } else if ("isDependency" in first) {
      dep = first;
    } else {
      dep = new Project(first, projectCallback);
    }
    this[target][dep.name] = dep;
    this.dependencyLinks.delete(dep.name);
    this.linkIsDevDependency.delete(dep.name);
    if (isProjectCallback(projectCallback)) {
      projectCallback(dep);
    }
    return dep;
  }
  pkgJSONWithDeps(resolvedLinks) {
    let dependencies = this.depsToObject(this.dependencyProjects());
    let devDependencies = this.depsToObject(this.devDependencyProjects());
    for (let [name, { requestedRange }] of resolvedLinks) {
      if (this.linkIsDevDependency.has(name)) {
        devDependencies[name] = requestedRange;
      } else {
        dependencies[name] = requestedRange;
      }
    }
    return Object.assign(this.pkg, {
      dependencies,
      devDependencies
    });
  }
  depsToObject(deps) {
    let obj = {};
    deps.forEach((dep) => obj[dep.name] = dep.requestedRange);
    return obj;
  }
};
function deserializePackageJson(serialized) {
  return JSON.parse(serialized);
}
function keys(object) {
  if (object !== null && (typeof object === "object" || Array.isArray(object))) {
    return Object.keys(object);
  } else {
    return [];
  }
}
function isProjectCallback(maybe) {
  return typeof maybe === "function";
}
function getString(obj, propertyName, errorMessage) {
  const value = obj[propertyName];
  if (typeof value === "string") {
    return value;
  } else {
    throw new TypeError(errorMessage || `expected 'string' but got '${typeof value}'`);
  }
}
function getFile(dir, fileName) {
  const value = dir[fileName];
  if (typeof value === "string") {
    return value;
  } else if (typeof value === "object" && value !== null) {
    throw new TypeError(`Expected a file for name '${String(fileName)}' but got a 'Folder'`);
  } else {
    throw new TypeError(`Expected a file for name '${String(fileName)}' but got '${typeof value}'`);
  }
}
function getFolder(dir, fileName) {
  const value = dir[fileName];
  if (isDirJSON(value)) {
    return value;
  } else if (typeof value === "string") {
    throw new TypeError(`Expected a file for name '${String(fileName)}' but got 'File'`);
  } else {
    throw new TypeError(`Expected a folder for name '${String(fileName)}' but got '${typeof value}'`);
  }
}
function isDirJSON(value) {
  return typeof value === "object" && value !== null;
}
function getPackageName(pkg) {
  return getString(pkg, "name", `package.json is missing a name.`);
}
function getPackageVersion(pkg) {
  return getString(pkg, "version", `${getPackageName(pkg)}'s package.json is missing a version.`);
}
function parseScoped(name) {
  let matched = name.match(/(@[^@\/]+)\/(.*)/);
  if (matched) {
    return {
      scope: matched[1],
      name: matched[2]
    };
  }
  return null;
}
function unwrapPackageName(obj, packageName) {
  let scoped = parseScoped(packageName);
  if (scoped) {
    return getFolder(getFolder(obj, scoped.scope), scoped.name);
  }
  return getFolder(obj, packageName);
}
function isObject(e) {
  return e !== null && typeof e === "object" && !Array.isArray(e);
}
function isErrnoException(e) {
  return isObject(e) && "code" in e;
}
function readString(name) {
  try {
    return import_fs_extra.default.readFileSync(name, "utf8");
  } catch (e) {
    if (isErrnoException(e)) {
      if (e.code === "ENOENT" || e.code === "EISDIR") {
        return;
      }
    }
    throw e;
  }
}
function readdir(name) {
  try {
    return import_fs_extra.default.readdirSync(name);
  } catch (e) {
    if (isErrnoException(e)) {
      if (e.code === "ENOENT" || e.code === "ENOTDIR") {
        return [];
      }
    }
    throw e;
  }
}
function readPackage(dir) {
  if (dir) {
    const fileName = import_path.default.join(dir, "package.json");
    const content = readString(fileName);
    if (content) {
      return { pkg: deserializePackageJson(content), path: dir };
    }
  }
  return;
}
function readPackages(modulesPath) {
  const pkgs = [];
  for (const name of readdir(modulesPath)) {
    if (name.startsWith("@")) {
      const scopePath = import_path.default.join(modulesPath, name);
      for (const name2 of readdir(scopePath)) {
        const pkg = readPackage(import_path.default.join(scopePath, name2));
        if (pkg)
          pkgs.push(pkg);
      }
    } else {
      const pkg = readPackage(import_path.default.join(modulesPath, name));
      if (pkg)
        pkgs.push(pkg);
    }
  }
  return pkgs;
}
Project.prototype.writeSync = (0, import_util.deprecate)(
  Project.prototype.writeSync,
  "project.writeSync() is deprecated. Use await project.write() instead"
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Project
});
