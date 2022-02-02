import { TextDocument } from 'vscode-languageserver-textdocument';
import * as path from 'path';
import { promises as fs } from 'fs';
import { WorkspaceManager } from '../../src/services/workspaceManager';
import { createConnection } from 'vscode-languageserver/node';

export async function getDoc(filename: string): Promise<TextDocument> {
  const file = await fs.readFile(path.resolve('test', 'data', filename), {
    encoding: 'utf8',
  });
  const docUri = path.resolve('test', 'data', filename).toString();
  return TextDocument.create(docUri, 'ansible', 1, file);
}

export function isWindows(): boolean {
  // win32 applies to x64 arch too, is the platform name
  return process.platform === 'win32';
}

export function createTestWorkspaceManager(): WorkspaceManager {
  process.argv.push('--node-ipc');
  const connection = createConnection();
  const workspaceManager = new WorkspaceManager(connection);

  return workspaceManager;
}
