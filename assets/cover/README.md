# Book cover downloads

92 entries (76 English and 16 Chinese-titled books) have downloaded cover images. Images are embedded in
`*.asset.json` files as data URLs, following the repository's media pointer
convention. No external request is needed to display an embedded image.

`manifest.json` maps each shelf title to its cover file, matched title, author,
source page, original image URL, and match status. Existing JPEG files are retained.

Selections:
- Reminiscences: Douglas MacArthur.
- Selected Essays and Essays: First and Second Series: Ralph Waldo Emerson.
- Other Asimov stories and essays: Nightfall, as requested.
- Series entries use representative first-volume covers (The Maze Runner,
  Foundation, and I, Robot).
- Prussia Without Legends uses the English edition The Rise and Fall of Prussia
  by Sebastian Haffner.
- Common Sense and Rights of Man uses a combined Thomas Paine edition titled
  Rights of Man; and, Common Sense.
- Henry IV uses Part 1; State of the Union Address uses the Ulysses S. Grant
  edition because no author or year was specified on the shelf.

To load an image, fetch its JSON and use the `url` property as the image source.
To refresh downloads, run `python scripts/download-book-covers.py` from the
repository root. The script uses the reviewed manifest rather than guessing
title matches again.

Chinese-titled entries use Chinese editions where available. 春秋 uses the annotated
春秋三传（第一册） edition; 敌基督者 uses an English edition of The Anti-Christ.
Translated-title aliases (including Das Kapital) resolve to the same cover.

Actual image files are also saved alongside the asset pointers. The manifest
`image_file` field identifies each JPEG, PNG, or WebP download. All 92 image
files were decoded and verified before saving.
