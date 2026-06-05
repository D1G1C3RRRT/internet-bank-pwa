# Generuj ikony a splash screen
flutter pub run flutter_launcher_icons:main
flutter pub run flutter_native_splash:create

# Build IPA (vyžaduje macOS)
flutter build ios --release
cd ios
xcodebuild -workspace Runner.xcworkspace -scheme Runner -configuration Release archive -archivePath $PWD/build/Runner.xcarchive
xcodebuild -exportArchive -archivePath $PWD/build/Runner.xcarchive -exportOptionsPlist ExportOptions.plist -exportPath $PWD/build
