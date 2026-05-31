import Foundation

class APIService {

    static let baseURL = "http://127.0.0.1:3000"

    // MARK: - GET Portfolio
    static func fetchPortfolio(completion: @escaping (Portfolio?) -> Void) {

        guard let url = URL(string: "\(baseURL)/portfolio") else {
            print("❌ Invalid URL")
            completion(nil)
            return
        }

        URLSession.shared.dataTask(with: url) { data, response, error in

            if let error = error {
                print("❌ Network error:", error)
                completion(nil)
                return
            }

            if let http = response as? HTTPURLResponse {
                print("📡 Status code:", http.statusCode)
            }

            guard let data = data else {
                print("❌ No data")
                completion(nil)
                return
            }

            let raw = String(data: data, encoding: .utf8) ?? "nil"
            print("🔥 RAW RESPONSE:")
            print(raw)

            do {
                let decoded = try JSONDecoder().decode(Portfolio.self, from: data)

                DispatchQueue.main.async {
                    completion(decoded)
                }

            } catch {
                print("❌ JSON decode error:", error)
                completion(nil)
            }

        }.resume()
    }

    // MARK: - POST Add Asset
    static func addAsset(name: String, value: Double, type: String, completion: (() -> Void)? = nil) {

        guard let url = URL(string: "\(baseURL)/add") else {
            print("❌ Invalid URL")
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "name": name,
            "value": value,
            "type": type
        ]

        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        } catch {
            print("❌ JSON encode error:", error)
            return
        }

        URLSession.shared.dataTask(with: request) { data, response, error in

            if let error = error {
                print("❌ Request error:", error)
                return
            }

            if let http = response as? HTTPURLResponse {
                print("📡 POST status:", http.statusCode)
            }

            if let data = data {
                let raw = String(data: data, encoding: .utf8) ?? "nil"
                print("🔥 POST RESPONSE:")
                print(raw)
            }

            DispatchQueue.main.async {
                completion?()
            }

        }.resume()
    }
}