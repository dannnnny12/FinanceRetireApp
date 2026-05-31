import SwiftUI

struct AddAssetView: View {

    @State private var name = ""
    @State private var value = ""
    @State private var type = "stock"

    var body: some View {
        Form {

            TextField("Name", text: $name)
            TextField("Value", text: $value)

            Picker("Type", selection: $type) {
                Text("stock").tag("stock")
                Text("bond").tag("bond")
                Text("cash").tag("cash")
                Text("liability").tag("liability")
            }

            Button("Save") {
                APIService.addAsset(
                    name: name,
                    value: Double(value) ?? 0,
                    type: type
                )
            }
        }
    }
}