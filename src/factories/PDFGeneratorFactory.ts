import { PDFGenerator } from "@/services/pdf/PDFGenerator";
import { StandardPDFGenerator } from "@/services/pdf/StandardPDFGenerator";
import { MinimalPDFGenerator } from "@/services/pdf/MinimalPDFGenerator";
import { DetailedPDFGenerator } from "@/services/pdf/DetailedPDFGenerator";

export type PDFType = "standard" | "minimal" | "detailed";

export class PDFGeneratorFactory {
    static create(type: PDFType): PDFGenerator {
        switch (type) {
            case "minimal":
                return new MinimalPDFGenerator();
            case "detailed":
                return new DetailedPDFGenerator();
            case "standard":
            default:
                return new StandardPDFGenerator();
        }
    }

    static createFromOptions(options: { 
        includeImages: boolean;
        includeSpecs: boolean;
        includeTerms: boolean;
        includeWarranty: boolean;
        includeDelivery: boolean;   
    }): PDFGenerator {
        if (!options.includeImages && !options.includeSpecs) {
            return new MinimalPDFGenerator();
        }
        if (options.includeImages && options.includeSpecs && options.includeTerms) {
            return new DetailedPDFGenerator();
        }
        return new StandardPDFGenerator();
    }
}