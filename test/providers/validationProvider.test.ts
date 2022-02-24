import { expect } from 'chai';
import { Position } from 'vscode';
import { getYamlValidation } from '../../src/providers/validationProvider';
import {
  createTestWorkspaceManager,
  getDoc,
  setFixtureAnsibleCollectionPathEnv,
} from '../helper';

setFixtureAnsibleCollectionPathEnv();

describe('doValidate()', () => {
  const workspaceManager = createTestWorkspaceManager();

  describe('Ansible diagnostics', () => {
    describe('Diagnostics using ansible-lint', () => {
      const tests = [
        {
          name: 'specific ansible lint errors',
          file: 'diagnostics/lint_errors.yml',
          diagnosticReport: [
            {
              severity: 1,
              message: 'violates variable naming standards',
              range: {
                start: { line: 4, character: 0 } as Position,
                end: {
                  line: 4,
                  character: Number.MAX_SAFE_INTEGER,
                } as Position,
              },
              source: 'Ansible',
            },
            {
              severity: 1,
              message: 'All tasks should be named',
              range: {
                start: { line: 6, character: 0 } as Position,
                end: {
                  line: 6,
                  character: Number.MAX_SAFE_INTEGER,
                } as Position,
              },
              source: 'Ansible',
            },
            {
              severity: 1,
              // eslint-disable-next-line quotes
              message: "Don't compare to empty string",
              range: {
                start: { line: 9, character: 0 } as Position,
                end: {
                  line: 9,
                  character: Number.MAX_SAFE_INTEGER,
                } as Position,
              },
              source: 'Ansible',
            },
            {
              severity: 1,
              message:
                'Commands should not change things if nothing needs doing',
              range: {
                start: { line: 14, character: 0 } as Position,
                end: {
                  line: 14,
                  character: Number.MAX_SAFE_INTEGER,
                } as Position,
              },
              source: 'Ansible',
            },
          ],
        },
        {
          name: 'empty playbook',
          file: 'diagnostics/empty.yml',
          diagnosticReport: [
            {
              severity: 1,
              message: '[syntax-check] Empty playbook, nothing to do',
              range: {
                start: { line: 0, character: 0 } as Position,
                end: {
                  line: 0,
                  character: Number.MAX_SAFE_INTEGER,
                } as Position,
              },
              source: 'Ansible',
            },
          ],
        },
        {
          name: 'no host',
          file: 'diagnostics/noHost.yml',
          diagnosticReport: [
            {
              severity: 1,
              message: '[syntax-check] Ansible syntax check failed',
              range: {
                start: { line: 0, character: 0 } as Position,
                end: {
                  line: 0,
                  character: Number.MAX_SAFE_INTEGER,
                } as Position,
              },
              source: 'Ansible',
            },
          ],
        },
      ];

      tests.forEach(({ name, file, diagnosticReport }) => {
        it(`should provide diagnostics for ${name}`, async function () {
          const textDoc = await getDoc(file);
          const context = workspaceManager.getContext(textDoc.uri);

          const actualDiagnostics = await context.ansibleLint.doValidate(
            textDoc
          );

          if (actualDiagnostics !== -1 && actualDiagnostics.size !== 0) {
            expect(
              actualDiagnostics.get(`file://${textDoc.uri}`).length
            ).to.equal(diagnosticReport.length);

            actualDiagnostics
              .get(`file://${textDoc.uri}`)
              .forEach((diag, i) => {
                const actDiag = diag;
                const expDiag = diagnosticReport[i];

                expect(actDiag.message).include(expDiag.message);
                expect(actDiag.range).to.deep.equal(expDiag.range);
                expect(actDiag.severity).to.equal(expDiag.severity);
                expect(actDiag.source).to.equal(expDiag.source);
              });
          }
        });
      });
    });
    describe('Diagnostics using ansible-playbook --syntax-check', () => {
      const tests = [
        {
          name: 'no host',
          file: 'diagnostics/noHost.yml',
          diagnosticReport: [
            {
              severity: 1,
              // eslint-disable-next-line quotes
              message: "the field 'hosts' is required but was not set",
              range: {
                start: { line: 0, character: 0 } as Position,
                end: {
                  line: 0,
                  character: Number.MAX_SAFE_INTEGER,
                } as Position,
              },
              source: 'Ansible',
            },
          ],
        },
        {
          name: 'empty playbook',
          file: 'diagnostics/empty.yml',
          diagnosticReport: [
            {
              severity: 1,
              message: 'Empty playbook',
              range: {
                start: { line: 0, character: 0 } as Position,
                end: {
                  line: 0,
                  character: Number.MAX_SAFE_INTEGER,
                } as Position,
              },
              source: 'Ansible',
            },
          ],
        },
      ];

      tests.forEach(({ name, file, diagnosticReport }) => {
        it(`should provide diagnostics for ${name}`, async function () {
          const textDoc = await getDoc(file);
          const context = workspaceManager.getContext(textDoc.uri);

          const actualDiagnostics = await context.ansiblePlaybook.doValidate(
            textDoc
          );

          if (actualDiagnostics.size !== 0) {
            expect(
              actualDiagnostics.get(`file://${textDoc.uri}`).length
            ).to.equal(diagnosticReport.length);

            actualDiagnostics
              .get(`file://${textDoc.uri}`)
              .forEach((diag, i) => {
                const actDiag = diag;
                const expDiag = diagnosticReport[i];

                expect(actDiag.message).include(expDiag.message);
                expect(actDiag.range).to.deep.equal(expDiag.range);
                expect(actDiag.severity).to.equal(expDiag.severity);
                expect(actDiag.source).to.equal(expDiag.source);
              });
          }
        });
      });
    });
  });

  describe('YAML diagnostics', () => {
    const tests = [
      {
        name: 'invalid YAML',
        file: 'diagnostics/invalid_yaml.yml',
        diagnosticReport: [
          {
            severity: 1,
            message: 'Nested mappings are not allowed',
            range: {
              start: { line: 6, character: 13 } as Position,
              end: {
                line: 6,
                character: 13,
              } as Position,
            },
            source: 'Ansible [YAML]',
          },
          {
            severity: 1,
            message: 'Document contains trailing content',
            range: {
              start: { line: 7, character: 0 } as Position,
              end: {
                line: 8,
                character: 0,
              } as Position,
            },
            source: 'Ansible [YAML]',
          },
        ],
      },
    ];

    tests.forEach(({ name, file, diagnosticReport }) => {
      it(`should provide diagnostic for ${name}`, async function () {
        const textDoc = await getDoc(file);

        const actualDiagnostics = getYamlValidation(textDoc);

        expect(actualDiagnostics.length).to.equal(diagnosticReport.length);

        actualDiagnostics.forEach((diag, i) => {
          const actDiag = diag;
          const expDiag = diagnosticReport[i];

          expect(actDiag.message).include(expDiag.message);
          expect(actDiag.range).to.deep.equal(expDiag.range);
          expect(actDiag.severity).to.equal(expDiag.severity);
          expect(actDiag.source).to.equal(expDiag.source);
        });
      });
    });
  });
});
