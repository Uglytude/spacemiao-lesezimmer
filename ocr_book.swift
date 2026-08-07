import Foundation
import Vision
import AppKit

struct OcrLine: Codable {
    let text: String
    let bbox: BBox
}
struct BBox: Codable {
    let x: Double, y: Double, width: Double, height: Double
}
struct PageData: Codable {
    let page: Int
    let webImage: String
    let hasText: Bool
    let lines: [OcrLine]
}
struct BookData: Codable {
    let title: String
    let author: String
    let pageCount: Int
    let pages: [PageData]
}

func ocrImage(path: String) -> [OcrLine] {
    guard let image = NSImage(contentsOfFile: path),
          let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        return []
    }
    var results: [OcrLine] = []
    let sem = DispatchSemaphore(value: 0)
    let request = VNRecognizeTextRequest { req, err in
        defer { sem.signal() }
        guard let obs = req.results as? [VNRecognizedTextObservation] else { return }
        for ob in obs {
            guard let top = ob.topCandidates(1).first else { continue }
            let box = ob.boundingBox
            results.append(OcrLine(
                text: top.string,
                bbox: BBox(x: box.origin.x, y: box.origin.y, width: box.width, height: box.height)
            ))
        }
    }
    request.recognitionLevel = .accurate
    request.recognitionLanguages = ["de-DE", "en-US"]
    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    try? handler.perform([request])
    sem.wait()
    return results
}

let args = CommandLine.arguments
guard args.count >= 4 else {
    print("Usage: ocr_book <bookDir> <title> <author>")
    exit(1)
}
let bookDir = args[1]
let title = args[2]
let author = args[3]

let pagesDir = bookDir + "/pages-web"
let fm = FileManager.default
let files = try! fm.contentsOfDirectory(atPath: pagesDir).sorted()
let jpgs = files.filter { $0.hasSuffix(".jpg") }

var pages: [PageData] = []
for (i, file) in jpgs.enumerated() {
    let path = pagesDir + "/" + file
    let lines = ocrImage(path: path)
    let page = PageData(page: i + 1, webImage: file, hasText: !lines.isEmpty, lines: lines)
    pages.append(page)
    print("  Page \(i+1)/\(jpgs.count): \(lines.count) lines")
}

let book = BookData(title: title, author: author, pageCount: jpgs.count, pages: pages)
let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
let data = try! encoder.encode(book)
let outPath = bookDir + "/data/ocr.json"
try! data.write(to: URL(fileURLWithPath: outPath))
print("✅ OCR saved to \(outPath)")
