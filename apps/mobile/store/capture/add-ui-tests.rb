# Adds the ShotsUITests UI-testing bundle (and a scheme to run it) to the
# generated ios/ project. ios/ is rebuilt by `expo prebuild`, so capture.sh runs
# this each time; it is a no-op when the target is already there.
#
# Runs on the xcodeproj gem that ships with CocoaPods.
require "xcodeproj"

root = File.expand_path("../..", __dir__)
project_path = File.join(root, "ios/DSAinTypeScript.xcodeproj")
project = Xcodeproj::Project.open(project_path)
exit 0 if project.targets.any? { |t| t.name == "ShotsUITests" }

app = project.targets.find { |t| t.name == "DSAinTypeScript" }
target = project.new_target(:ui_test_bundle, "ShotsUITests", :ios, "16.4")
target.add_dependency(app)
group = project.main_group.find_subpath("ShotsUITests", true)
group.set_source_tree("SOURCE_ROOT")
file = group.new_reference(File.join(__dir__, "ShotsUITests.swift"))
target.add_file_references([file])
target.build_configurations.each do |c|
  c.build_settings["PRODUCT_NAME"] = "$(TARGET_NAME)"
  c.build_settings["TEST_TARGET_NAME"] = "DSAinTypeScript"
  c.build_settings["PRODUCT_BUNDLE_IDENTIFIER"] = "com.datastructuresandalgorithms.app.shots"
  c.build_settings["SWIFT_VERSION"] = "5.0"
  c.build_settings["GENERATE_INFOPLIST_FILE"] = "YES"
  c.build_settings["TARGETED_DEVICE_FAMILY"] = "1,2"
  c.build_settings["CODE_SIGNING_ALLOWED"] = "NO"
end
project.save

scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(app)
scheme.add_test_target(target)
scheme.set_launch_target(app)
scheme.save_as(project_path, "ShotsUITests", true)
puts "Added ShotsUITests"
