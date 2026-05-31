import Foundation

class PortfolioViewModel: ObservableObject {

    @Published var portfolio: Portfolio?{
        didSet {
            print("🔥 UI SHOULD UPDATE:", portfolio as Any)
        }
    }

    func load() {
        APIService.fetchPortfolio { data in
            print("📦 API RETURNED:", data as Any)
            self.portfolio = data
        }
    }
}