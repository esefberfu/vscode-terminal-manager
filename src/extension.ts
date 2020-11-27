'use strict';

import * as vscode from 'vscode';
import {Terminal as VSTerminal} from 'vscode';

import { TerminalManagerProvider, Terminal } from './terminalManager';

export function activate(context: vscode.ExtensionContext) {

	// Samples of `window.registerTreeDataProvider`
	const terminalManagerProvider = new TerminalManagerProvider(vscode.workspace.rootPath);
	vscode.window.registerTreeDataProvider('terminalManager', terminalManagerProvider);
	vscode.commands.registerCommand('terminalManager.refresh', () => terminalManagerProvider.refresh());
	vscode.commands.registerCommand('terminalManager.runOnTerminal', (uri:vscode.Uri) => terminalManagerProvider.runOnTerminal(uri));
	vscode.commands.registerCommand('terminalManager.createTerminal', () => terminalManagerProvider.createTerminal());
	vscode.commands.registerCommand('terminalManager.editTerminal', (terminal: Terminal) => terminalManagerProvider.renameTerminal(terminal));
	vscode.commands.registerCommand('terminalManager.deleteTerminal', (terminal: Terminal) => terminalManagerProvider.closeTerminal(terminal));
	vscode.commands.registerCommand('terminalManager.showTerminal', (terminal: Terminal) => terminalManagerProvider.showTerminal(terminal));
	vscode.commands.registerCommand('terminalManager.showTerminalMinimized', (terminal: Terminal) => terminalManagerProvider.showTerminalMinimized(terminal));
	vscode.commands.registerCommand('terminalManager.hideTerminalPanel', (terminal: Terminal) => terminalManagerProvider.hideTerminalPanel());

	vscode.window.onDidOpenTerminal((terminal) => {
		terminalManagerProvider.refresh();
	});

	vscode.window.onDidCloseTerminal((terminal) => {
		terminalManagerProvider.refresh();
	});
}