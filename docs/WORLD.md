# World: accepted structure and implementation gap

Canonical story: [lore.md](design/lore.md); structure: [world-structure.md](design/world-structure.md);
enemy proposal: [enemies-c22-roster.md](design/enemies-c22-roster.md) and its regional final cards.
[story-c28.md](design/story-c28.md) is a proposal, not automatically shipped story.

The five regions are the Hollow, Sunken Coast, Emberwaste, Pale Reach and Gloamvale. The accepted structure
has seven areas per region, five zones per area, five regular fights then a Shadowborn Captain per zone,
an area Champion and a separate region Elder. The spec totals 218 fights per region. Captains share their
monster's pack with a recolour and an extra move. Season 1 ends with the first fight against the Voice;
the Voice retreats and the story continues. Preserve owner-chosen names and the sealed lore's access boundary.

The live build is narrower: `22-data-regions.js` provides the Hollow and Coast; only the Thorn Imp and Gloomjaw
have complete C22 integrations. Coast content still reuses Hollow assets in places. Verify the source before
claiming a Captain, Champion, region or story beat exists. First-clear/boss-rematch loot changes remain a design
question in the world structure spec. Lore delivery uses `55-story.js` and the existing region/story data files.
