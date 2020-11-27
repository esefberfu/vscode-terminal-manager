"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Terminal = exports.TerminalManagerProvider = void 0;
const vscode = require("vscode");
const fs = require("fs");
const util = require("util");
const path = require("path");
const os = require('os');
const readFile = util.promisify(fs.readFile);
const writeFIle = util.promisify(fs.readFile);
class TerminalManagerProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    async runInTerminal(uri) {
        let terminal = await this.createTerminal();
        let cmd = await readFile(uri.fsPath);
        terminal.sendText(cmd.toString());
    }
    async createTerminal() {
        const input = await vscode.window.showInputBox({
            placeHolder: 'Enter name of the terminal:'
        });
        let shellPath = '';
        if (os.platform() === 'darwin')
            shellPath = '/bin/zsh';
        else if (os.platform() === 'linux')
            shellPath = '/bin/bash';
        else if (os.platform() === 'win32')
            shellPath = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
        const terminal = vscode.window.createTerminal({
            shellPath: shellPath,
            shellArgs: [],
            name: (input) ? input : 'Terminal'
        });
        await terminal.show(true);
        this.fullScreen();
        this.refresh();
        return terminal;
    }
    async closeTerminal(terminal) {
        terminal.vsTerminal.dispose();
        this.refresh();
    }
    async showTerminalMinimized(terminal) {
        terminal.vsTerminal.show(true);
        await this.minimize();
    }
    async showTerminal(terminal) {
        terminal.vsTerminal.show(true);
        this.fullScreen();
    }
    async hideTerminalPanel() {
        await vscode.commands.executeCommand('workbench.action.togglePanel');
    }
    async fullScreen() {
        await vscode.commands.executeCommand('workbench.action.togglePanel');
        await vscode.commands.executeCommand('workbench.action.toggleMaximizedPanel');
    }
    async minimize() {
        await vscode.commands.executeCommand('workbench.action.toggleEditorVisibility');
    }
    renameTerminal(terminal) {
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return Promise.resolve(vscode.window.terminals.map((t, i) => {
            return new Terminal((i + 1).toString() + '. ' + t.name, '', t, vscode.TreeItemCollapsibleState.None);
        }));
    }
}
exports.TerminalManagerProvider = TerminalManagerProvider;
class Terminal extends vscode.TreeItem {
    constructor(label, version, vsTerminal, collapsibleState) {
        super(label, collapsibleState);
        this.label = label;
        this.version = version;
        this.vsTerminal = vsTerminal;
        this.collapsibleState = collapsibleState;
        this.iconPath = {
            light: path.join(__filename, '..', '..', 'resources', 'light', 'terminal.svg'),
            dark: path.join(__filename, '..', '..', 'resources', 'dark', 'terminal.svg')
        };
        this.contextValue = 'terminal';
        this.command = {
            command: 'terminalManager.showTerminal',
            title: '',
            arguments: [this]
        };
        this.tooltip = `${this.label}-${this.version}`;
        this.description = this.version;
    }
}
exports.Terminal = Terminal;
//# sourceMappingURL=terminalManager.js.map