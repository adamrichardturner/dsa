import XCTest

/// Walks the installed app through the screens the App Store listing shows and
/// saves each at the device's native resolution. capture.sh passes, as
/// TEST_RUNNER_ variables: SHOTS_DIR, SHOTS_EMAIL, SHOTS_PASSWORD, and
/// SHOTS_LESSON (the lesson title to open, "Stacks" by default).
final class ShotsUITests: XCTestCase {
  let app = XCUIApplication(bundleIdentifier: "com.datastructuresandalgorithms.app")
  var env: [String: String] { ProcessInfo.processInfo.environment }

  override func setUp() {
    continueAfterFailure = false
    app.launch()
    signInIfNeeded()
  }

  func testCourse() { tab("Course"); settle(4); shot("course") }

  func testProgress() { tab("Progress"); settle(4); shot("progress") }

  func testArticles() {
    tab("Articles")
    settle(3)
    // A fresh launch can swallow the first tap: try again until the screen shows.
    for _ in 0..<4 where !app.staticTexts["Articles"].exists || app.staticTexts["The course"].exists { tab("Articles"); settle(2) }
    shot("articles")
  }

  func testLesson() {
    openLesson()
    // Let the reading's diagrams render.
    settle(8)
    shot("lesson")
  }

  /// The gap exercise half done: the first blank filled, the second waiting.
  func testPractice() {
    openLesson()
    scrollTo(label: "Empty gap")
    fill(gapIndex: 0, with: env["SHOTS_GAP_0"] ?? "last !== opener")
    settle(1)
    // Select the next blank so its outline shows where a snippet will go.
    app.buttons.matching(NSPredicate(format: "label == %@", "Empty gap")).firstMatch.tap()
    settle(1)
    shot("practice")
  }

  /// The same exercise after a pass: each blank outlined in green.
  func testPassed() {
    openLesson()
    scrollTo(label: "Empty gap")
    fill(gapIndex: 0, with: env["SHOTS_GAP_0"] ?? "last !== opener")
    fill(gapIndex: 0, with: env["SHOTS_GAP_1"] ?? "stack.length === 0")
    let submit = app.buttons["Submit"].firstMatch
    if submit.exists { submit.tap() }
    settle(6)
    shot("passed")
  }

  // MARK: - Helpers

  private func openLesson() {
    tab("Course")
    settle(2)
    let title = env["SHOTS_LESSON"] ?? "Stacks"
    let row = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "\(title). ")).firstMatch
    for _ in 0..<30 where !(row.exists && row.isHittable) { app.swipeUp(velocity: .slow) }
    row.tap()
    settle(5)
  }

  private func scrollTo(label: String) {
    let el = app.buttons.matching(NSPredicate(format: "label == %@", label)).firstMatch
    for _ in 0..<40 where !(el.exists && el.isHittable && el.frame.maxY < app.frame.height * 0.74) {
      // On an iPad the exercise has its own pane on the right.
      if app.frame.width > 900 {
        app.coordinate(withNormalizedOffset: CGVector(dx: 0.78, dy: 0.7)).press(forDuration: 0.05, thenDragTo: app.coordinate(withNormalizedOffset: CGVector(dx: 0.78, dy: 0.45)))
      } else {
        app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.7)).press(forDuration: 0.05, thenDragTo: app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.45)))
      }
    }
    settle(1)
  }

  /// Taps the nth empty blank, then the snippet with that text.
  private func fill(gapIndex: Int, with text: String) {
    let gaps = app.buttons.matching(NSPredicate(format: "label == %@", "Empty gap"))
    XCTAssertTrue(gaps.element(boundBy: gapIndex).waitForExistence(timeout: 5), "A blank is there")
    gaps.element(boundBy: gapIndex).tap()
    settle(0.6)
    let chips = app.buttons.matching(NSPredicate(format: "label == %@", text))
    XCTAssertTrue(chips.firstMatch.waitForExistence(timeout: 5), "\(text) is offered")
    chips.element(boundBy: chips.count - 1).tap()
    settle(0.8)
  }

  private func signInIfNeeded() {
    let email = app.textFields.firstMatch
    guard email.waitForExistence(timeout: 8) else { return }
    let address = env["SHOTS_EMAIL"] ?? ""
    for _ in 0..<4 where (email.value as? String) != address {
      email.tap()
      settle(1)
      let current = (email.value as? String) ?? ""
      if !current.isEmpty && current != "Email" {
        email.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: current.count + 2))
      }
      email.typeText(address)
    }
    let password = app.secureTextFields.firstMatch
    password.tap()
    password.typeText(env["SHOTS_PASSWORD"] ?? "")
    app.buttons["Sign in"].firstMatch.tap()
    let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
    let deadline = Date().addingTimeInterval(40)
    while Date() < deadline && !app.tabBars.firstMatch.exists && !app.buttons["Course"].exists {
      for label in ["Not Now", "Don’t Allow", "Don't Allow", "Not now", "Cancel"] {
        if app.buttons[label].exists { app.buttons[label].tap() }
        if springboard.buttons[label].exists { springboard.buttons[label].tap() }
      }
      settle(1)
    }
    settle(3)
  }

  private func tab(_ name: String) {
    let bar = app.tabBars.buttons[name]
    if bar.waitForExistence(timeout: 8) { bar.tap() } else { app.buttons[name].firstMatch.tap() }
    if bar.exists { bar.tap() }
  }

  private func settle(_ seconds: TimeInterval = 3) {
    _ = XCTWaiter.wait(for: [XCTestExpectation(description: "settle")], timeout: seconds)
  }

  private func shot(_ name: String) {
    let dir = env["SHOTS_DIR"] ?? NSTemporaryDirectory()
    let png = XCUIScreen.main.screenshot().pngRepresentation
    let url = URL(fileURLWithPath: dir).appendingPathComponent("\(name).png")
    try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
    XCTAssertNoThrow(try png.write(to: url))
  }
}
