import SwiftUI

struct DashboardView: View {
    
    @StateObject var vm = PortfolioViewModel()

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {

                Text("💰 Net Worth")
                    .font(.title)

                Text("\(vm.portfolio?.netWorth ?? 0, specifier: "%.0f")")
                    .font(.largeTitle)
                    .bold()

                List {

                    Section("Assets") {
                        ForEach(vm.portfolio?.assets ?? []) { item in
                            HStack {
                                Text(item.name)
                                Spacer()
                                Text("\(item.marketValue ?? 0, specifier: "%.0f")")
                            }
                        }
                    }

                    Section("Liabilities") {
                        ForEach(vm.portfolio?.liabilities ?? []) { item in
                            HStack {
                                Text(item.name)
                                Spacer()
                                Text("-\(item.value, specifier: "%.0f")")
                                    .foregroundColor(.red)
                            }
                        }
                    }
                }

                NavigationLink("➕ Add Asset", destination: AddAssetView())
                    .padding()

            }
            .onAppear {
                vm.load()
                print("LOAD CALLED")
            }
        }
    }
}