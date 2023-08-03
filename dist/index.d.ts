import fixturify from 'fixturify';
import { PackageJson as PackageJson$1 } from 'type-fest';

type PackageJson = PackageJson$1 & Record<string, any>;
type ProjectCallback = (project: Project) => void;
interface ReadDirOpts {
    linkDeps?: boolean;
    linkDevDeps?: boolean;
}
interface ProjectArgs {
    name?: string;
    version?: string;
    files?: fixturify.DirJSON;
    requestedRange?: string;
}
declare class Project {
    pkg: PackageJson;
    files: fixturify.DirJSON;
    readonly isDependency = true;
    private _dependencies;
    private _devDependencies;
    private _baseDir;
    private _tmp;
    private requestedRange;
    private dependencyLinks;
    private linkIsDevDependency;
    private usingHardLinks;
    private resolutionCache;
    constructor(name?: string, version?: string, args?: Omit<ProjectArgs, 'name' | 'version'>, projectCallback?: ProjectCallback);
    constructor(name?: string, version?: string, args?: Omit<ProjectArgs, 'name' | 'version'>);
    constructor(name?: string, version?: string, projectCallback?: ProjectCallback);
    constructor(name?: string, args?: Omit<ProjectArgs, 'name'>, projectCallback?: ProjectCallback);
    constructor(args?: ProjectArgs, projectCallback?: ProjectCallback);
    /**
     * @deprecated Please use baseDir instead.
     *
     * @readonly
     * @memberof Project
     */
    get root(): void;
    /**
     * Sets the base directory of the project.
     *
     * @memberof Project
     * @param dir - The directory path.
     */
    set baseDir(dir: string);
    /**
     * Gets the base directory path, usually a tmp directory unless a baseDir has been explicitly set.
     *
     * @readonly
     * @memberof Project
     */
    get baseDir(): string;
    /**
     * Gets the package name from the package.json.
     *
     * @type {string}
     * @memberof Project
     */
    get name(): string;
    /**
     * Sets the package name in the package.json.
     *
     * @memberof Project
     */
    set name(value: string);
    /**
     * Gets the version number from the package.json.
     *
     * @type {string}
     * @memberof Project
     */
    get version(): string;
    /**
     * Sets the version number in the package.json.
     *
     * @memberof Project
     */
    set version(value: string);
    /**
     * Reads an existing project from the specified root.
     *
     * @param root - The base directory to read the project from.
     * @param opts - An options object.
     * @param opts.linkDeps - Include linking dependencies from the Project's node_modules.
     * @param opts.linkDevDeps - Include linking devDependencies from the Project's node_modules.
     * @returns - The deserialized Project.
     */
    static fromDir(root: string, opts?: ReadDirOpts): Project;
    /**
     * Merges an object containing a directory represention with the existing files.
     *
     * @param dirJSON - An object containing a directory representation to merge.
     */
    mergeFiles(dirJSON: fixturify.DirJSON): void;
    /**
     * Writes the existing files property containing a directory representation to the tmp directory.
     *
     * @param dirJSON? - An optional object containing a directory representation to write.
     */
    write(dirJSON?: fixturify.DirJSON): Promise<void>;
    /**
     * @deprecated Please use `await project.write()` instead.
     */
    writeSync(): void;
    addDependency(name?: string, version?: string, args?: Omit<ProjectArgs, 'name' | 'version'>, projectCallback?: ProjectCallback): Project;
    addDependency(name?: string, version?: string, projectCallback?: ProjectCallback): Project;
    addDependency(name?: string, args?: Omit<ProjectArgs, 'name'>, projectCallback?: ProjectCallback): Project;
    addDependency(args?: ProjectArgs, projectCallback?: ProjectCallback): Project;
    addDependency(args?: Project, projectCallback?: ProjectCallback): Project;
    /**
     * Adds a devDependency to the Project's package.json.
     *
     * @returns - The Project instance.
     */
    addDevDependency(name?: string, version?: string, args?: Omit<ProjectArgs, 'name' | 'version'>, projectCallback?: ProjectCallback): Project;
    addDevDependency(name?: string, version?: string, projectCallback?: ProjectCallback): Project;
    addDevDependency(name?: string, args?: Omit<ProjectArgs, 'name'>, projectCallback?: ProjectCallback): Project;
    addDevDependency(args?: ProjectArgs, projectCallback?: ProjectCallback): Project;
    addDevDependency(args?: Project, projectCallback?: ProjectCallback): Project;
    /**
     * Removes a dependency to the Project's package.json.
     *
     * @param name - The name of the dependency to remove.
     */
    removeDependency(name: string): void;
    /**
     * Removes a devDependency.
     *
     * @param name - The name of the devDependency to remove.
     */
    removeDevDependency(name: string): void;
    /**
     * Links a dependency.
     *
     * @param name - The name of the dependency to link.
     */
    linkDependency(name: string, opts: LinkParams): void;
    /**
     * Links a devDependency.
     *
     * @param name - The name of the dependency to link.
     */
    linkDevDependency(name: string, opts: LinkParams): void;
    /**
     * @returns - An array of the dependencies for this Projct.
     */
    dependencyProjects(): Project[];
    /**
     * @returns - An array of the devDependencies for this Projct.
     */
    devDependencyProjects(): Project[];
    /**
     * @returns - The cloned Project.
     */
    clone(): Project;
    /**
     * Disposes of the tmp directory that the Project is stored in.
     */
    dispose(): void;
    protected writeProject(): void;
    private assignBaseDirs;
    private writeFiles;
    private finalizeWrite;
    private resolveLinks;
    private binLinks;
    private writeLinkedPackage;
    private hardLinkContents;
    private hardLinkFile;
    private readSync;
    private addDep;
    private pkgJSONWithDeps;
    private depsToObject;
}
type LinkParams = {
    baseDir: string;
    resolveName?: string;
    requestedRange?: string;
} | {
    target: string;
    requestedRange?: string;
} | {
    project: Project;
    requestedRange?: string;
};

export { LinkParams, Project, ProjectArgs };
