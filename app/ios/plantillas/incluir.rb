#!/usr/bin/env ruby
# incluir.rb — mete en el proyecto de Xcode (ios/App/App.xcodeproj) lo que
# aplicar.sh copio a ios/App/App/ y Xcode no recoge solo: el manifiesto de
# privacidad (PrivacyInfo.xcprivacy) y las frases de los permisos en los diez
# idiomas (<idioma>.lproj/InfoPlist.strings), y los idiomas en «Localizations»
# (knownRegions). Lo que en un Mac se haria con «Add Files to App…», hecho
# aqui con la gema xcodeproj (viene con fastlane), para la App Store sin Mac.
# Desde el 21 de octubre de 2026 (LANZAMIENTO-APP-STORE.md §9). Sin Mac aqui:
# comprobado en seco; se ve pasar en la primera ejecucion del workflow.
#
#     cd app && bundle exec ruby ios/plantillas/incluir.rb
#
# Si el proyecto usa carpetas sincronizadas (formato de Xcode 16 o mas), todo
# lo que hay en la carpeta ya entra solo: entonces no toca nada y lo dice.
require 'xcodeproj'

RUTA = File.expand_path('../../App/App.xcodeproj', __dir__)
abort "No encuentro #{RUTA}: antes, «npx cap add ios»" unless File.directory?(RUTA)
proyecto = Xcodeproj::Project.open(RUTA)
target = proyecto.targets.find { |t| t.name == 'App' } or abort 'No hay target App'
carpeta = File.expand_path('../../App/App', __dir__)
grupo = proyecto.main_group['App'] or abort 'No hay grupo App en el proyecto'

if grupo.class.name.include?('Synchronized')
  puts "  el grupo App es una carpeta sincronizada (#{grupo.class.name}): Xcode recoge solo lo que hay en #{carpeta}"
else
  cambios = 0
  # 1. PrivacyInfo.xcprivacy, como recurso del target
  if File.exist?(File.join(carpeta, 'PrivacyInfo.xcprivacy'))
    ref = grupo.files.find { |f| f.path == 'PrivacyInfo.xcprivacy' }
    unless ref
      ref = grupo.new_file('PrivacyInfo.xcprivacy')
      cambios += 1
    end
    unless target.resources_build_phase.files_references.include?(ref)
      target.add_resources([ref])
      cambios += 1
    end
    puts '  PrivacyInfo.xcprivacy: en el target'
  else
    puts '  *** no hay PrivacyInfo.xcprivacy en ios/App/App/: antes, aplicar.sh ***'
  end
  # 2. InfoPlist.strings: un grupo de variantes con un fichero por idioma
  idiomas = Dir.glob(File.join(carpeta, '*.lproj', 'InfoPlist.strings')).map { |f| File.basename(File.dirname(f)).sub('.lproj', '') }.sort
  if idiomas.empty?
    puts '  *** no hay *.lproj/InfoPlist.strings en ios/App/App/: antes, aplicar.sh ***'
  else
    variantes = grupo.children.find { |c| c.is_a?(Xcodeproj::Project::Object::PBXVariantGroup) && c.name == 'InfoPlist.strings' }
    unless variantes
      variantes = grupo.new_variant_group('InfoPlist.strings')
      cambios += 1
    end
    idiomas.each do |l|
      next if variantes.files.any? { |f| f.name == l || f.path.to_s.start_with?("#{l}.lproj/") }
      ref = variantes.new_reference("#{l}.lproj/InfoPlist.strings")
      ref.name = l
      cambios += 1
    end
    unless target.resources_build_phase.files_references.include?(variantes)
      target.add_resources([variantes])
      cambios += 1
    end
    # 3. los idiomas del proyecto
    regiones = (proyecto.root_object.known_regions + idiomas + ['Base']).uniq
    if regiones != proyecto.root_object.known_regions
      proyecto.root_object.known_regions = regiones
      cambios += 1
    end
    puts "  InfoPlist.strings: #{idiomas.size} idiomas (#{idiomas.join(' ')}) en el target y en Localizations"
  end
  proyecto.save if cambios > 0
  puts cambios > 0 ? "  proyecto guardado (#{cambios} cambios)" : '  nada que cambiar: ya estaba'
end
