import * as vscode from 'vscode';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import {Terminal as VSTerminal} from 'vscode';

const os = require('os');
const readFile = util.promisify(fs.readFile);
const writeFIle = util.promisify(fs.readFile);

export class TerminalManagerProvider implements vscode.TreeDataProvider<Terminal> {

	private _onDidChangeTreeData: vscode.EventEmitter<Terminal | undefined | void> = new vscode.EventEmitter<Terminal | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Terminal | undefined | void> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string) {
		
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	async runOnTerminal(uri:vscode.Uri): Promise<void> {
		let terminal = await this.createTerminal();
		let cmd = await readFile(uri.fsPath);
		terminal.sendText(cmd.toString());
	}

	async createTerminal(): Promise<VSTerminal> {
		const input = await vscode.window.showInputBox({
			placeHolder:'Enter name of the terminal:'
		});
		await this.fullScreen();

		let shellPath = '';
		if(os.platform() === 'darwin')
			shellPath = '/bin/zsh';
		else if(os.platform() === 'linux')
			shellPath = '/bin/bash';
		else if(os.platform() === 'win32')
			shellPath = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';

		const terminal = vscode.window.createTerminal({
			shellPath: shellPath,
			shellArgs: [],
			name: (input) ? input : 'Terminal'
		});
		terminal.show(true);
		this.refresh();
		return terminal;
	}

	async closeTerminal(terminal: Terminal): Promise<void> {
		terminal.vsTerminal.dispose();
		this.refresh();
	}

	async showTerminalMinimized(terminal: Terminal): Promise<void> {
		terminal.vsTerminal.show(true);
		await this.minimize()
	}

	async showTerminal(terminal: Terminal): Promise<void> {
		terminal.vsTerminal.show(true);
		this.fullScreen();
	}

	async fullScreen(): Promise<void> {
		await vscode.commands.executeCommand('workbench.action.togglePanel');
		await vscode.commands.executeCommand('workbench.action.toggleMaximizedPanel');
	}

	async minimize(): Promise<void> {
		await vscode.commands.executeCommand('workbench.action.toggleEditorVisibility');
	}



	renameTerminal(terminal: Terminal): void {

	}

	getTreeItem(element: Terminal): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Terminal): Thenable<Terminal[]> {
		return Promise.resolve(vscode.window.terminals.map((t, i) => {
			return new Terminal((i+1).toString()+'. '+t.name, '', t, vscode.TreeItemCollapsibleState.None);
		}));
	}

	
}

export class Terminal extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		private readonly version: string,
		public readonly vsTerminal: VSTerminal,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(label, collapsibleState);

		this.command = {
			command: 'terminalManager.showTerminal',
			title: '',
			arguments: [this]
		}
		this.tooltip = `${this.label}-${this.version}`;
		this.description = this.version;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'terminal.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'terminal.svg')
	};

	contextValue = 'terminal';
}
