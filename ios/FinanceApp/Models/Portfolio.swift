import Foundation

struct Portfolio: Codable {
    let assets: [Asset]
    let liabilities: [Liability]
    let totalAssetValue: Double
    let totalLiability: Double
    let netWorth: Double
}