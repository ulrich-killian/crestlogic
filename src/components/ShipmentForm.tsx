/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Lock, 
  Trash2, 
  Plus, 
  UploadCloud, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle, 
  Package, 
  Dumbbell, 
  Maximize2,
  Sparkles
} from "lucide-react";
import { ShipmentFormData, ManifestItem } from "../types";
import { SAMPLE_INVOICES, generateTrackingId } from "../utils";
import { motion, AnimatePresence } from "motion/react";

interface ShipmentFormProps {
  formData: ShipmentFormData;
  onChange: (updated: ShipmentFormData) => void;
  isAnalyzing: boolean;
  onAutoParse: (parsed: any) => void;
}

export default function ShipmentForm({
  formData,
  onChange,
  isAnalyzing,
  onAutoParse
}: ShipmentFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [parsingLogs, setParsingLogs] = useState<string | null>(null);


  const handleFieldChange = (key: keyof ShipmentFormData, value: any) => {
    onChange({
      ...formData,
      [key]: value
    });
  };

  const handleAddItem = () => {
    const newItem: ManifestItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: "",
      qty: 1
    };
    onChange({
      ...formData,
      items: [...formData.items, newItem]
    });
  };


  const handleItemChange = (itemId: string, name: string, qty: number) => {
    const updatedItems = formData.items.map(item => {
      if (item.id === itemId) {
        return { ...item, name, qty: Math.max(1, qty) };
      }
      return item;
    });
    onChange({
      ...formData,
      items: updatedItems
    });
  };


  const handleDeleteItem = (itemId: string) => {
    if (formData.items.length <= 1) return; 
    onChange({
      ...formData,
      items: formData.items.filter(item => item.id !== itemId)
    });
  };


  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      simulateFileParsing(file.name);
    }
  };


  const simulateFileParsing = (fileName: string) => {
    setParsingLogs(`Reading ${fileName} secure segments...`);
    

    const templateName = Object.keys(SAMPLE_INVOICES).find(
      key => fileName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(fileName.toLowerCase())
    );

    setTimeout(() => {
      setParsingLogs("Analyzing document layout coordinates...");
      setTimeout(() => {
        if (templateName && SAMPLE_INVOICES[templateName]) {
          const parsed = SAMPLE_INVOICES[templateName];
          onAutoParse({
            ...parsed,
            orderId: generateTrackingId() 
          });
          setParsingLogs(`Successfully parsed invoice! Pulled ${parsed.items.length} items to cargo table.`);
        } else {
      
          const randomParsed = {
            orderId: generateTrackingId(),
            customerName: "Global Ingress Partner",
            destination: "Boulevard de la Liberté, Douala, Cameroon",
            origin: "California, USA",
            items: [
              { id: "rand-1", name: `Parsed Item from ${fileName.substring(0, 15)}`, qty: 5 },
              { id: "rand-2", name: "Heavy-Duty Protective Wrap", qty: 1 }
            ],
            weight: 75,
            dimensions: "60x60x82 cm",
            fragile: true,
            uploadedFiles: [fileName]
          };
          onAutoParse(randomParsed);
          setParsingLogs("Standard structural invoice parsed. Custom items auto-loaded.");
        }

      
        setTimeout(() => setParsingLogs(null), 4000);
      }, 1000);
    }, 60000000); 
    
 
    setTimeout(() => {
      setParsingLogs("Structuring logistics manifest cells...");
      setTimeout(() => {
        if (templateName && SAMPLE_INVOICES[templateName]) {
          const parsed = SAMPLE_INVOICES[templateName];
          onAutoParse({
            ...parsed,
            orderId: generateTrackingId(),
            uploadedFiles: [fileName]
          });
          setParsingLogs(`Success: Integrated OCR manifest payload.`);
        } else {
          onAutoParse({
            orderId: generateTrackingId(),
            customerName: "Global Freight Receiver",
            destination: "Main Port Cargo Warehouse, Mombasa, Kenya",
            origin: "London, UK",
            items: [
              { id: `rand-${Date.now()}-1`, name: `Cargo Manifest Category: A`, qty: 8 },
              { id: `rand-${Date.now()}-2`, name: `Specialist Insulation Packing Units`, qty: 2 }
            ],
            weight: 125,
            dimensions: "90x95x120 cm",
            fragile: false,
            uploadedFiles: [fileName]
          });
          setParsingLogs("Custom document mapped to default shipment profile.");
        }
        setTimeout(() => setParsingLogs(null), 3000);
      }, 800);
    }, 850);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 md:p-6 shadow-sm flex flex-col gap-6">
    
      <div className="flex justify-between items-center pb-4 border-b border-stone-100">
        <div>
          <h2 className="font-sans font-bold text-[#111E19] text-lg uppercase tracking-wider flex items-center gap-2">
            <Package className="w-5 h-5 text-[#A35638]" />
            Register Shipment
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Build container manifests, weigh freight boxes, and optimize routing node paths.
          </p>
        </div>
        <span className="bg-stone-100 text-stone-600 border border-stone-200 text-xs font-mono px-3 py-1 rounded-full font-bold tracking-widest flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-pulse"></span>
          DRAFT
        </span>
      </div>


      <div className="flex flex-col gap-5">
        
    
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-xs font-sans font-bold text-[#111E19] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              Manifest Registry ID
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={formData.orderId}
                className="w-full border border-stone-200 rounded-xl bg-stone-50 text-stone-500 font-mono text-sm px-4 py-3 focus:outline-none focus:ring-0 select-all cursor-not-allowed"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] bg-stone-200 text-stone-600 px-2 py-0.5 rounded font-mono font-bold">
                SYSTEM
              </span>
            </div>
          </div>

     
          <div>
            <label className="block text-xs font-sans font-bold text-[#111E19] uppercase tracking-wider mb-1.5">
              Consignee / Customer Name
            </label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => handleFieldChange("customerName", e.target.value)}
              placeholder="e.g., Amara Diallo"
              className="w-full border border-stone-200 focus:border-[#A35638] rounded-xl bg-stone-50/50 hover:bg-stone-50 focus:bg-white text-sm px-4 py-3 text-[#111E19] placeholder-stone-400 font-medium focus:outline-none focus:ring-0 transition-all"
            />
          </div>

     
          <div>
            <label className="block text-xs font-sans font-bold text-[#111E19] uppercase tracking-wider mb-1.5 font-extrabold flex items-center gap-1">
              Origin Warehouse / Hub
            </label>
            <input
              type="text"
              value={formData.origin || ""}
              onChange={(e) => handleFieldChange("origin", e.target.value)}
              placeholder="e.g., California, USA"
              className="w-full border border-stone-200 focus:border-[#A35638] rounded-xl bg-stone-50/50 hover:bg-stone-50 focus:bg-white text-sm px-4 py-3 text-[#111E19] placeholder-stone-400 font-medium focus:outline-none focus:ring-0 transition-all"
            />
          </div>

     
          <div>
            <label className="block text-xs font-sans font-bold text-[#111E19] uppercase tracking-wider mb-1.5 font-extrabold flex items-center gap-1">
              Destination Terminal Address
            </label>
            <input
              type="text"
              required
              value={formData.destination}
              onChange={(e) => handleFieldChange("destination", e.target.value)}
              placeholder="e.g., Toronto, Canada"
              className="w-full border border-stone-200 focus:border-[#A35638] rounded-xl bg-stone-50/50 hover:bg-stone-50 focus:bg-white text-sm px-4 py-3 text-[#111E19] placeholder-stone-400 font-medium focus:outline-none focus:ring-0 transition-all"
            />
          </div>

        </div>

        <div className="mt-2 bg-stone-50/50 rounded-2xl border border-stone-200/50 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-sans font-extrabold text-[#111E19] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#A35638]"></span>
              Container Cargo Manifest ({formData.items.length})
            </h3>
            <span className="text-[10px] text-stone-500 font-mono">
              VERIFIED ITEM WEIGHT MULTIPLIERS
            </span>
          </div>


          <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {formData.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-stone-200/60 shadow-xs"
                >
           
                  <span className="w-6 h-6 rounded-full bg-[#FAF5E9] text-[#111E19] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

     
                  <input
                    type="text"
                    required
                    value={item.name}
                    placeholder="e.g., Solar Module Boards"
                    onChange={(e) => handleItemChange(item.id, e.target.value, item.qty)}
                    className="flex-grow border-0 focus:border-0 rounded-lg text-sm px-2.5 py-1.5 focus:outline-none text-[#111E19] placeholder-stone-400 font-medium"
                  />

            
                  <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden h-9 bg-stone-50">
                    <button
                      type="button"
                      onClick={() => handleItemChange(item.id, item.name, item.qty - 1)}
                      className="px-3 hover:bg-stone-200 text-stone-500 text-sm font-bold transition-colors"
                      disabled={item.qty <= 1}
                    >
                      -
                    </button>
                    <span className="w-8 shrink-0 text-center font-mono text-xs font-bold text-[#111E19]">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleItemChange(item.id, item.name, item.qty + 1)}
                      className="px-3 hover:bg-stone-200 text-stone-500 text-sm font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>

       
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 transition-colors duration-200 disabled:opacity-30 disabled:pointer-events-none"
                    disabled={formData.items.length <= 1}
                    title="Remove Manifest Row"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="mt-3.5 w-full border border-dashed border-[#A35638]/50 text-[#A35638] hover:bg-[#A35638]/5 active:bg-[#A35638]/10 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Manifest Column Item
          </button>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-stone-50/20 p-4 border border-stone-100 rounded-2xl">
          

          <div>
            <label className="block text-xs font-sans font-bold text-[#111E19] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-stone-400" />
              Gross Weight
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={formData.weight || ""}
                onChange={(e) => handleFieldChange("weight", Number(e.target.value))}
                placeholder="0"
                className="w-full border border-stone-200 focus:border-[#A35638] rounded-xl bg-white text-sm pl-4 pr-12 py-3 text-[#111E19] placeholder-stone-400 font-mono font-semibold focus:outline-none focus:ring-0 transition-all text-right"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-500 font-mono font-bold bg-[#FAF5E9] border border-stone-200 rounded px-1.5 py-0.5 pointer-events-none">
                kg
              </span>
            </div>
          </div>


          <div>
            <label className="block text-xs font-sans font-bold text-[#111E19] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
              Dimensions
            </label>
            <input
              type="text"
              value={formData.dimensions}
              onChange={(e) => handleFieldChange("dimensions", e.target.value)}
              placeholder="LxWxH cm"
              className="w-full border border-stone-200 focus:border-[#A35638] rounded-xl bg-white text-sm px-4 py-3 text-[#111E19] placeholder-stone-400 font-mono font-medium focus:outline-none"
            />
          </div>


          <div className="flex flex-col">
            <span className="text-xs font-sans font-bold text-[#111E19] uppercase tracking-wider mb-3">
              Special Handling Rating
            </span>
            <div className="flex items-center justify-between h-12 px-4 bg-white border border-stone-200 rounded-xl">
              <span className="text-xs font-sans font-semibold text-stone-600">
                Fragile Cargo
              </span>
              <button
                type="button"
                onClick={() => handleFieldChange("fragile", !formData.fragile)}
                className={`relative w-11 h-6 transition-colors duration-300 rounded-full focus:outline-none ${
                  formData.fragile ? "bg-[#A35638]" : "bg-stone-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 transition-transform duration-300 transform bg-white rounded-full shadow-md ${
                    formData.fragile ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

        </div>


        <div className="flex flex-col gap-2.5">
          <label className="block text-xs font-sans font-bold text-[#111E19] uppercase tracking-wider">
            Consignment Invoices & OCR Capture
          </label>
          
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center p-5 rounded-xl border h-36 border-dashed ${
              dragActive 
                ? "border-[#A35638] bg-[#FAF5E9]/60 scale-[1.01]" 
                : "border-stone-300 hover:border-stone-400 bg-stone-50/50"
            }`}
          >
            <input
              id="file-upload-input"
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  simulateFileParsing(e.target.files[0].name);
                }
              }}
            />
            <label htmlFor="file-upload-input" className="cursor-pointer max-w-sm flex flex-col items-center justify-center">
              <UploadCloud className="w-8 h-8 text-stone-400 mb-2 animate-bounce-slow" />
              <p className="text-xs font-sans font-bold text-[#111E19] mb-1">
                Drag & drop wholesale invoice to auto-parse parameters
              </p>
              <p className="text-[10px] text-stone-500 font-sans">
                Supports PDF manifests, XLS cargo tables, or JPEG invoice photos up to 10MB
              </p>
            </label>
          </div>


          <div className="bg-[#FAF5E9]/40 border border-[#FAF5E9] rounded-xl p-3.5">
            <p className="text-[10px] font-sans font-extrabold text-[#111E19] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              Standardized OCR Test-Beds (Click to Parse)
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => simulateFileParsing("medical_supplies_manifest_9a.pdf")}
                className="flex items-center gap-1.5 bg-white hover:bg-[#FAF5E9]/70 hover:border-[#A35638]/50 border border-stone-200 px-3 py-1.5 rounded-full text-[11px] font-sans font-medium text-stone-700 transition-all shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                medical_supplies_manifest.pdf
              </button>
              <button
                type="button"
                onClick={() => simulateFileParsing("industrial_motor_invoice_88.pdf")}
                className="flex items-center gap-1.5 bg-white hover:bg-[#FAF5E9]/70 hover:border-[#A35638]/50 border border-stone-200 px-3 py-1.5 rounded-full text-[11px] font-sans font-medium text-stone-700 transition-all shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                industrial_motor_invoice.pdf
              </button>
              <button
                type="button"
                onClick={() => simulateFileParsing("micro_electronics_invoice.xlsx")}
                className="flex items-center gap-1.5 bg-white hover:bg-[#FAF5E9]/70 hover:border-[#A35638]/50 border border-stone-200 px-3 py-1.5 rounded-full text-[11px] font-sans font-medium text-stone-700 transition-all shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                micro_electronics_table.xlsx
              </button>
            </div>
          </div>


          <AnimatePresence>
            {parsingLogs && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#111E19] text-[#F7E4A1] px-4 py-3 rounded-xl font-mono text-xs flex items-center justify-between border border-[#FAF5E9]/20"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#A35638] animate-ping shrink-0" />
                  <span>{parsingLogs}</span>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>


          {formData.uploadedFiles.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest font-bold">
                Registered Invoices ({formData.uploadedFiles.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {formData.uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-1 px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-sans text-stone-600">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-medium max-w-xs truncate">{f}</span>
                    <button
                      type="button"
                      onClick={() => {
                        onChange({
                          ...formData,
                          uploadedFiles: formData.uploadedFiles.filter((_, idx) => idx !== i)
                        });
                      }}
                      className="ml-1 text-stone-400 hover:text-rose-600 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
