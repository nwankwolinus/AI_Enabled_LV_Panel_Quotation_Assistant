// ============================================
// IMPORT COMPONENTS MODAL
// File: src/components/forms/ImportComponentsModal.tsx
// ============================================

'use client';

import { useState, useRef } from 'react';
import { Button, Card } from '@/components';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { useImportComponents } from '@/hooks/useComponents';
import { useUIStore } from '@/store/useUIStore';

interface ImportComponentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedComponent {
  vendor: string;
  item: string;
  model: string;
  manufacturer: string;
  price: number;
  currency: string;
  amperage?: string;
  poles?: string;
  type?: string;
  specification?: string;
  category?: string;
}

export default function ImportComponentsModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: ImportComponentsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedComponent[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const importComponents = useImportComponents();
  const { showToast } = useUIStore();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(selectedFile.type) && 
        !selectedFile.name.endsWith('.csv') && 
        !selectedFile.name.endsWith('.xlsx')) {
      showToast('Please upload a CSV or Excel file', 'error');
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    await parseFile(selectedFile);
  };

  const parseFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('File must contain headers and at least one data row');
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const data: ParsedComponent[] = [];
      const parseErrors: string[] = [];

      // Required fields
      const requiredFields = ['vendor', 'item', 'model', 'manufacturer', 'price'];
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required columns: ${missingFields.join(', ')}`);
      }

      // Parse each row
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const row: any = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          // Validate required fields
          const missing = requiredFields.filter(field => !row[field]);
          if (missing.length > 0) {
            parseErrors.push(`Row ${i + 1}: Missing ${missing.join(', ')}`);
            continue;
          }

          // Parse price
          const price = parseFloat(row.price);
          if (isNaN(price) || price < 0) {
            parseErrors.push(`Row ${i + 1}: Invalid price "${row.price}"`);
            continue;
          }

          data.push({
            vendor: row.vendor,
            item: row.item,
            model: row.model,
            manufacturer: row.manufacturer,
            price: price,
            currency: row.currency || 'NGN',
            amperage: row.amperage || '',
            poles: row.poles || '',
            type: row.type || '',
            specification: row.specification || '',
            category: row.category || '',
          });
        } catch (error) {
          parseErrors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
        }
      }

      setParsedData(data);
      setErrors(parseErrors);

      if (data.length === 0) {
        throw new Error('No valid components found in file');
      }

      showToast(`Parsed ${data.length} components`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse file';
      showToast(message, 'error');
      setErrors([message]);
      setParsedData([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      showToast('No components to import', 'warning');
      return;
    }

    try {
      await importComponents.mutateAsync(parsedData);
      showToast(`Successfully imported ${parsedData.length} components`, 'success');
      onSuccess();
      handleClose();
    } catch (error) {
      showToast('Failed to import components', 'error');
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Import Components</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Import Instructions</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Download the CSV template using the "Template" button</li>
              <li>Fill in your component data following the format</li>
              <li>Required columns: vendor, item, model, manufacturer, price</li>
              <li>Optional columns: currency, amperage, poles, type, specification, category</li>
              <li>Upload the completed file below</li>
            </ol>
          </div>

          {/* File Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-ppl-navy hover:bg-gray-50 transition-colors"
            >
              {file ? (
                <div className="space-y-2">
                  <FileSpreadsheet className="w-12 h-12 mx-auto text-green-600" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setParsedData([]);
                    setErrors([]);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}>
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">CSV or Excel files only</p>
                </div>
              )}
            </div>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ppl-navy mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Processing file...</p>
            </div>
          )}

          {/* Parse Results */}
          {parsedData.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">
                  Ready to import {parsedData.length} components
                </h3>
              </div>
              <div className="mt-2 max-h-40 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-green-800">
                    <tr>
                      <th className="pb-1">Item</th>
                      <th className="pb-1">Manufacturer</th>
                      <th className="pb-1">Price</th>
                    </tr>
                  </thead>
                  <tbody className="text-green-900">
                    {parsedData.slice(0, 5).map((comp, idx) => (
                      <tr key={idx}>
                        <td className="py-1">{comp.item}</td>
                        <td className="py-1">{comp.manufacturer}</td>
                        <td className="py-1">{comp.currency} {comp.price.toLocaleString()}</td>
                      </tr>
                    ))}
                    {parsedData.length > 5 && (
                      <tr>
                        <td colSpan={3} className="py-1 text-xs italic">
                          ... and {parsedData.length - 5} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900">
                  {errors.length} error(s) found
                </h3>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800 max-h-32 overflow-y-auto">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end p-6 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            className="bg-ppl-navy"
            onClick={handleImport}
            disabled={parsedData.length === 0 || importComponents.isPending}
          >
            {importComponents.isPending 
              ? 'Importing...' 
              : `Import ${parsedData.length} Component${parsedData.length !== 1 ? 's' : ''}`
            }
          </Button>
        </div>
      </Card>
    </div>
  );
}