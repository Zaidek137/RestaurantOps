import { useMemo, useState } from "react";
import type {
  ExpenseImportRow,
  LaborImportRow,
  MarketingImportRow,
  SalesImportRow,
} from "../lib/csv";
import {
  csvHeaderMap,
  parseExpenseCsv,
  parseLaborCsv,
  parseMarketingCsv,
  parseSalesCsv,
  type CsvImportResult,
} from "../lib/csv";
import { ActionModal } from "./ActionModal";
import { Icon } from "./Icon";

type ImportKind = "sales" | "labor" | "expense" | "marketing";

type ImportRows =
  | SalesImportRow[]
  | LaborImportRow[]
  | ExpenseImportRow[]
  | MarketingImportRow[];

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  kind: ImportKind;
  onImport: (rows: ImportRows) => number;
}

const parserMap = {
  sales: parseSalesCsv,
  labor: parseLaborCsv,
  expense: parseExpenseCsv,
  marketing: parseMarketingCsv,
} satisfies Record<
  ImportKind,
  (
    text: string,
  ) => CsvImportResult<SalesImportRow | LaborImportRow | ExpenseImportRow | MarketingImportRow>
>;

export const CsvImportModal = ({ isOpen, onClose, kind, onImport }: CsvImportModalProps) => {
  const [result, setResult] = useState<
    CsvImportResult<
      SalesImportRow | LaborImportRow | ExpenseImportRow | MarketingImportRow
    > | null
  >(null);
  const [fileName, setFileName] = useState("");
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      return;
    }

    const text = await file.text();
    setFileName(file.name);
    setImportedCount(null);
    setResult(parserMap[kind](text));
  };

  const title = useMemo(() => {
    switch (kind) {
      case "sales":
        return "Import sales CSV";
      case "labor":
        return "Import labor CSV";
      case "expense":
        return "Import expenses CSV";
      case "marketing":
        return "Import marketing CSV";
      default:
        return "Import CSV";
    }
  }, [kind]);

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={() => {
        setResult(null);
        setFileName("");
        setImportedCount(null);
        onClose();
      }}
      title={title}
      subtitle="Upload a CSV, preview it, and commit validated rows into local storage."
    >
      <div className="import-modal">
        <div className="import-modal__hero">
          <div>
            <strong>Required headers</strong>
            <p>{csvHeaderMap[kind].join(", ")}</p>
          </div>
          <label className="button-secondary import-upload-button">
            <Icon name="upload" className="button-icon" width={18} height={18} />
            <span>{fileName ? "Replace CSV" : "Choose CSV"}</span>
            <input
              className="visually-hidden"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {result ? (
          <div className="import-results">
            <div className="import-results__summary">
              <span>Parsed rows: {result.rows.length}</span>
              <span>Preview rows: {result.preview.length}</span>
              <span>Errors: {result.errors.length}</span>
            </div>

            {result.errors.length > 0 ? (
              <div className="import-errors">
                {result.errors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            ) : null}

            {result.preview.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Row</th>
                      {result.headers.map((header) => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.preview.map((row) => (
                      <tr key={row.rowNumber}>
                        <td>{row.rowNumber}</td>
                        {result.headers.map((header) => (
                          <td key={`${row.rowNumber}-${header}`}>{row.values[header]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <div className="import-actions">
              {importedCount !== null ? <p>Imported {importedCount} rows into local storage.</p> : null}
              <button
                type="button"
                className="button-primary"
                disabled={result.errors.length > 0 || result.rows.length === 0}
                onClick={() => {
                  const count = onImport(result.rows as ImportRows);
                  setImportedCount(count);
                }}
              >
                Commit import
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <strong>No CSV loaded yet</strong>
            <p>Upload a file to preview its rows and validate required columns before import.</p>
          </div>
        )}
      </div>
    </ActionModal>
  );
};
