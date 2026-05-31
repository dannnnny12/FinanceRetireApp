import Foundation

struct Liability: Codable, Identifiable {
    let id: Int
    let type: String?
    let name: String
    let value: Double
}