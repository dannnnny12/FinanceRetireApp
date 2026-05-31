import Foundation

struct Asset: Codable, Identifiable {
    let id: Int
    let type: String
    let name: String
    let value: Double
    let marketValue: Double?
}