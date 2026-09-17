/**
 * Назначение: словарь английского языка (канонический источник ключей).
 *
 * Функции:
 * - задаёт полный набор ключей интерфейса; тип MessageKey выводится отсюда;
 * - остальные локали обязаны повторить все ключи (completeness через типы).
 *
 * Слой: i18n (/src/i18n/locales). Данные без логики.
 */

export const en = {
  // Навигация и заголовки.
  'nav.projects': 'Projects',
  'nav.camera': 'Camera',
  'nav.settings': 'Settings',
  'nav.project': 'Project',
  'nav.photo': 'Photo',
  'nav.compare': 'Compare',
  'nav.timelapse': 'Timelapse',
  'nav.support': 'Support',

  // Общие.
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.done': 'Done',
  'common.back': 'Back',

  // Время/даты.
  'time.days': {
    one: '{count} day',
    other: '{count} days',
  },

  // Список проектов.
  'projects.emptyTitle': 'Watch the changes',
  'projects.emptyDescription':
    'Create a project and take the first photo. The next shot can be aligned with the previous one.',
  'projects.emptyButton': 'Create first project',
  'projects.header': 'Projects',
  'projects.create': 'Create',
  'projects.rename': 'Rename',
  'projects.noPhotos': 'No photos',
  'projects.photoCount': { one: '{count} photo', other: '{count} photos' },
  'projects.deleteTitle': 'Delete project?',
  'projects.deleteMessage': '“{name}” and all of its photos will be permanently deleted.',
  'projects.newProject': 'New project',
  'projects.renameProject': 'Rename project',
  'projects.namePlaceholder': 'Project name',

  // Экран проекта.
  'project.notFound': 'Project not found',
  'project.notFoundHint': 'It may have been deleted.',
  'project.noPhotosTitle': 'No photos yet',
  'project.noPhotosHint': 'Take the first shot on the Camera tab.',
  'project.sourceGhost': 'Ghost source: {source}',
  'project.sourceLatest': 'Latest photo',
  'project.sourceFirst': 'First photo',
  'project.sourceManual': 'Manual reference',
  'project.takeShot': 'Take a photo',
  'project.noSnapshots': 'No photos yet',
  'project.period': '{from} → {to}',
  'project.first': 'First',
  'project.last': 'Last',
  'project.daysBetween': {
    one: '{count} day between photos',
    other: '{count} days between photos',
  },
  'project.compareFirstLast': 'Compare first and last photo',
  'project.quickCompare': 'Quick compare',
  'project.quickCompareHint': 'Pick two photos to compare the changes.',
  'project.quickCompareDisabled': 'Comparison appears after the second photo.',
  'project.oneShotHint': 'Take one more photo to see the changes.',
  'project.choose': 'Choose',
  'project.cancelSelection': 'Cancel',
  'project.selectTwo': 'Select two photos to compare',
  'project.selected': 'Selected: {count} of 2',
  'project.nextShot': 'Take next photo',
  'project.history': 'History',
  'project.showHidden': 'Show hidden',
  'project.hideRejected': 'Hide rejected',
  'project.reference': 'Reference',
  'project.deletePhotoTitle': 'Delete photo?',
  'project.deletePhotoMessage': 'The photo will be permanently deleted.',
  'project.firstPhotoHint': 'The first photo becomes your guide. Later it will appear translucent in the camera.',
  'project.firstShotButton': 'Take first photo',
  'project.allHiddenHint': 'All photos are hidden. Show hidden photos to see them.',

  // Камера.
  'camera.needPermission': 'Camera access required',
  'camera.permissionHint': 'Allow access to take progress photos.',
  'camera.permissionDenied': 'Access denied. Enable the camera in device settings.',
  'camera.allow': 'Allow access',
  'camera.noProjects': 'No projects yet',
  'camera.noProjectsHint': 'Create a project on the Projects tab to start shooting.',
  'camera.captureError': 'Could not save the photo',
  'camera.ghost': 'Ghost',
  'camera.grid': 'Grid',
  'camera.referenceLabel': 'Reference: {source}',
  'camera.visibility': 'Ghost visibility {percent}%',
  'camera.boosted': 'Ghost boosted. Tap the background again to return to normal visibility.',
  'camera.ghostSourceTitle': 'Ghost source',
  'camera.latest': 'Latest photo',
  'camera.latestHint': 'The most recent photo of the project',
  'camera.first': 'First photo',
  'camera.firstHint': 'The earliest photo of the project',
  'camera.manual': 'Choose manually',
  'camera.manualHint': 'Set a specific photo as reference',
  'camera.manualSelected': 'Reference chosen manually',
  'camera.manualMissing': 'The chosen reference is unavailable (deleted or hidden). Pick another.',
  'camera.sourceLatestShort': 'Latest',
  'camera.sourceFirstShort': 'First',
  'camera.sourceManualShort': 'Manual',
  'camera.pickReference': 'Choose a reference',
  'camera.noAvailablePhotos': 'No available photos.',
  'camera.shutterLabel': 'Take photo',

  // Просмотр фото.
  'viewer.actions': 'Actions',
  'viewer.compare': 'Compare',
  'viewer.addNote': 'Add note',
  'viewer.editNote': 'Edit note',
  'viewer.favorite': 'Add to favorites',
  'viewer.unfavorite': 'Remove from favorites',
  'viewer.hide': 'Hide photo',
  'viewer.unhide': 'Show again',
  'viewer.makeReference': 'Set as reference',
  'viewer.export': 'Export to gallery',
  'viewer.delete': 'Delete',
  'viewer.compareWith': 'Compare with',
  'viewer.withPrevious': 'With previous',
  'viewer.withFirst': 'With first',
  'viewer.withLast': 'With last',
  'viewer.pickCompare': 'Choose a photo to compare',
  'viewer.exportTitle': 'Export to gallery?',
  'viewer.exportMessage':
    'The photo will be copied to the device gallery and leave the app’s protected storage.',
  'viewer.exportAction': 'Export',
  'viewer.exportDone': 'Done',
  'viewer.exportSaved': 'Photo saved to gallery.',
  'viewer.exportError': 'Error',
  'viewer.exportFailed': 'Could not export the photo.',
  'viewer.noGalleryAccess': 'No gallery access',
  'viewer.galleryPermissionHint': 'Allow photo saving in device settings.',

  // Заметка.
  'note.title': 'Photo note',
  'note.placeholder': 'For example: after workout',
  'note.discardTitle': 'Discard changes?',
  'note.discardMessage': 'Your changes will be lost.',
  'note.discard': 'Discard',
  'note.keepEditing': 'Keep editing',

  // Сравнение.
  'compare.title': 'Compare',
  'compare.before': 'Before',
  'compare.after': 'After',
  'compare.slider': 'Slider',
  'compare.sideBySide': 'Side by side',
  'compare.overlay': 'Overlay',
  'compare.overlayLabel': 'After visibility: {percent}%',
  'compare.noPairTitle': 'No photos to compare',
  'compare.samePhoto': 'Choose two different photos to compare.',
  'compare.missing': 'Pick two photos from the project to compare them.',
  'compare.pickBefore': 'Choose “Before” photo',
  'compare.pickAfter': 'Choose “After” photo',
  'compare.samePhotoTitle': 'Can’t pick the same photo',
  'compare.samePhotoMessage': 'Choose different photos for “Before” and “After”.',

  // Настройки.
  'settings.title': 'Settings',
  'settings.biometrics': 'Biometric protection',
  'settings.biometricsHint': 'Require Face ID / Touch ID on launch',
  'settings.biometricsUnavailable': 'Biometrics unavailable on this device.',
  'settings.reminders': 'Reminders',
  'settings.remindersHint': 'Daily reminder to take a photo',
  'settings.remindersDenied': 'Notifications disabled. Enable them in device settings.',
  'settings.haptics': 'Haptic feedback',
  'settings.hapticsHint': 'Light vibration on capture and important actions',
  'settings.appearance': 'Appearance',
  'settings.colorMode': 'Color mode',
  'settings.system': 'System',
  'settings.light': 'Light',
  'settings.dark': 'Dark',
  'settings.modern': 'Modern',
  'settings.simple': 'Simple',
  'settings.neumorphism': 'Neumorphism',
  'settings.modernDesc': 'Native look for your platform',
  'settings.simpleDesc': 'Minimal effects, maximum readability',
  'settings.neumorphismDesc': 'Soft inset surfaces',
  'settings.modernNote': '“Modern” looks native: Liquid Glass on iOS and Material Design on Android.',
  'settings.language': 'Language',
  'language.change': 'Change language',
  'settings.support': 'Support developer',
  // Поддержка.
  'support.title': 'Support',
  'support.header': 'Support the developer',
  'support.about': 'About the app',
  'support.aboutText':
    'ProgressPrivate has no ads, analytics, or tracking. All photos and progress metadata are stored only on your device and are never sent to a server or third parties.',
  'support.premium': 'Premium',
  'support.active': 'Active',
  'support.inactive': 'Inactive',
  'support.premiumNote':
    'In-App Purchase is not connected yet — the toggle is a temporary development stub and does not cause charges.',

  // Блокировка.
  'lock.title': 'App locked',
  'lock.description': 'Confirm your identity to access your photos.',
  'lock.failed': 'Could not confirm. Try again.',
  'lock.error': 'Could not start biometrics. Try again.',
  'lock.unlock': 'Unlock',

  // Таймлапс.
  'timelapse.notEnough': 'Not enough photos',
  'timelapse.hint': 'You need at least one photo to view progress.',
  'timelapse.pause': 'Pause',
  'timelapse.resume': 'Resume',
} as const;

/** Ключ перевода — имя поля словаря. */
export type MessageKey = keyof typeof en;
