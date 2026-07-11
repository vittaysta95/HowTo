/* ===================================================================
   MODULE: Building a House
   -------------------------------------------------------------------
   This file only DESCRIBES the decision tree. The engine that renders
   it lives in index.html and never needs to change when you add a new
   module — to add a future guide (e.g. "Planning a Garden"), copy this
   file's shape into modules/garden.js and add one <script> tag in
   index.html. That's the whole "growing library" mechanism.

   Each step:
     id        - unique string, used as the key choices are stored under
     category  - controls brick color + which "layer" it sits in visually
     title     - short heading
     prompt    - the question shown to the user
     options   - EITHER a static array, OR a function(choices) => array
                 (used when earlier answers change what's on offer)
     showIf    - optional function(choices) => bool. Step is skipped
                 if this returns false (used for branching).

   ASSUMPTION: content assumes a Northern Hemisphere site (south-facing
   = more sun) since that's the common default; noted inline where it
   matters. Costs/percentages are rough rule-of-thumb, not a quote.
=================================================================== */

window.LEGO_MODULES = window.LEGO_MODULES || [];

window.LEGO_MODULES.push({
  id: 'house',
  title: 'Building a House',
  tagline: 'Step through every major design decision, brick by brick.',
  baseColor: '#4C9A2A', // grass-green baseplate for this module's home card

  steps: [
    // ---------------- PLANNING ----------------
    {
      id: 'permits_zoning',
      category: 'Planning',
      title: 'Zoning & permits reality check',
      watchFor: [
        'Zoning classification and permitted use for this exact parcel (not just the neighborhood in general)',
        'Easements on the title — drainage, sewer, shared driveway, or utility easements can block where you build',
        'Height limits, setback minimums, and any heritage/conservation overlay',
        'Flood zone, bushfire, or seismic overlay mapping for the parcel',
        'HOA / body corporate / covenant restrictions if they apply',
        'Whether an owner-builder path is even allowed here, if that matters to you',
      ],
      prompt: 'Before any design work, how much legal headroom do you have on this land?',
      options: [
        { id: 'clear', label: 'Zoning already confirmed for a house here',
          pros: ['No surprises mid-design', 'Can finalize plans with confidence'],
          cons: ['You may have already spent money confirming this'] },
        { id: 'unclear', label: 'Not checked yet — assuming it\'s fine',
          pros: ['Faster to start dreaming up designs'],
          cons: ['Risk of redesigning everything if zoning rejects it', 'Setback/height rules could invalidate later choices'] },
        { id: 'restricted', label: 'Known restrictions (height cap, heritage overlay, easements)',
          pros: ['You know the box you\'re designing inside — fewer late surprises'],
          cons: ['Some later options in this guide may not be legally available to you'] },
      ],
    },

    // ---------------- SITE ----------------
    {
      id: 'site_terrain',
      category: 'Site',
      title: 'Choose your land',
      watchFor: [
        'Exact easement locations on the title survey — drainage/sewer easements often run right where you\'d want to build',
        'Sewer main location and connection/invert level (affects whether gravity drainage works or you need a pump)',
        'Front, side, and rear setback minimums in your actual jurisdiction, not a rule of thumb',
        'Boundary survey pegs verified on-site — fences are often not on the real boundary',
        'Overland flow paths / flood mapping across the site',
        'Protected trees or vegetation the council won\'t let you remove',
        'Soil conditions if known already (reactive clay, rock, or uncontrolled fill)',
      ],
      prompt: 'What kind of site are you building on? This shapes almost everything downstream.',
      options: [
        { id: 'flat', label: 'Flat lot',
          pros: ['Cheapest foundation options', 'Simple drainage', 'Faster to build'],
          cons: ['Fewer dramatic views', 'No natural walkout level'] },
        { id: 'sloped', label: 'Sloped lot',
          pros: ['Walkout basement potential', 'Often better views', 'Gravity helps drainage'],
          cons: ['Foundation typically costs 15–40% more', 'Needs retaining walls / engineering'] },
        { id: 'waterfront', label: 'Waterfront or flood-prone',
          pros: ['Premium views and resale value'],
          cons: ['Flood insurance & elevation rules likely apply', 'Foundation must be raised or piered', 'Slower, costlier permitting'] },
      ],
    },
    {
      id: 'climate',
      category: 'Site',
      title: 'Climate zone',
      watchFor: [
        'Your jurisdiction\'s official climate zone rating (drives minimum insulation/glazing code later)',
        'Frost line depth — affects how deep footings must go',
        'Wind/cyclone/bushfire attack level rating for your specific area',
        'Historical extreme temperatures, not just averages — design for the bad week, not the typical one',
        'Any regional building code amendments layered on top of the base code for this climate',
      ],
      prompt: 'What\'s the dominant climate? Insulation, roof, and glazing choices all trace back to this.',
      options: [
        { id: 'cold_snow', label: 'Cold / snow-heavy',
          pros: ['Steep roofs shed snow well', 'Heating-focused design is well understood'],
          cons: ['Insulation & heating system cost more upfront'] },
        { id: 'hot_dry', label: 'Hot / dry',
          pros: ['Passive cooling and shading strategies are cheap and effective'],
          cons: ['Cooling loads dominate; poor shading is punishing'] },
        { id: 'hot_humid', label: 'Hot / humid',
          pros: ['Cross-ventilation strategies work well'],
          cons: ['Moisture management (mold/rot) becomes a first-class design problem'] },
        { id: 'temperate', label: 'Temperate / mixed',
          pros: ['Most flexibility — few extreme constraints'],
          cons: ['Easy to under-design for the one or two extreme weeks a year'] },
      ],
    },
    {
      id: 'orientation',
      category: 'Site',
      title: 'Sunlight & orientation',
      watchFor: [
        'True north vs. magnetic north — a compass reading alone can be off by a meaningful margin',
        'Shadow impact from existing neighboring buildings and trees, in winter as well as summer',
        'Local "solar access" rules protecting neighbors\' sunlight — can limit how tall/close you build',
        'Prevailing wind direction, for natural cross-ventilation later',
        'Street orientation constraints (garage/entry position often dictated by the street, not the sun)',
      ],
      prompt: 'Which way will the main façade face? (Northern-hemisphere assumption: south = most sun.)',
      options: [
        { id: 'south', label: 'Main façade faces south',
          pros: ['Maximizes passive solar heat & daylight in living areas', 'Best for solar panels later'],
          cons: ['Needs deliberate shading in summer or rooms overheat'] },
        { id: 'north', label: 'Main façade faces north',
          pros: ['Even, glare-free daylight — good for studios/work-from-home'],
          cons: ['Cooler interior; higher heating load in cold climates'] },
        { id: 'east_west', label: 'Main façade faces east–west',
          pros: ['Good morning or evening light depending on lifestyle'],
          cons: ['Low-angle sun is hard to shade — glare & heat gain at window height'] },
      ],
    },
    {
      id: 'lot_context',
      category: 'Site',
      title: 'Lot size & setting',
      watchFor: [
        'Exact building envelope diagram — where you\'re legally allowed to build on the lot, not just the setback numbers in isolation',
        'Driveway/crossover permit requirements and location',
        'Underground services already run under the lot (water, gas, electric, telecom) — get a utility locate before assuming clear ground',
        'Existing fence disputes or unclear boundary agreements with neighbors',
        'Tree preservation orders on anything already growing on or near the site',
        'For rural lots specifically: well/septic feasibility and emergency-service response distance',
      ],
      prompt: 'What\'s the surrounding density like?',
      options: [
        { id: 'urban', label: 'Urban infill (small, tight lot)',
          pros: ['Walkable location value', 'Utilities usually already at the lot line'],
          cons: ['Footprint constraints push you to build up, not out', 'Less room for excavation/equipment access'] },
        { id: 'suburban', label: 'Suburban standard lot',
          pros: ['Balanced flexibility for footprint and yard'],
          cons: ['Setback rules still limit maximum footprint'] },
        { id: 'rural', label: 'Rural / large acreage',
          pros: ['Freedom to sprawl single-storey', 'Fewer neighbor sightline constraints'],
          cons: ['Longer utility runs (well/septic/power) add cost', 'Emergency services response time may be longer'] },
      ],
    },

    // ---------------- STRUCTURE ----------------
    {
      id: 'foundation',
      category: 'Structure',
      title: 'Foundation type',
      watchFor: [
        'A current soil/geotech report — old reports can be invalid if the site or code has changed',
        'Water table depth at the actual building location, not just the general area',
        'Any existing services running under the planned footprint',
        'Structural engineer sign-off requirements for your chosen foundation type',
        'Waterproofing warranty terms in writing, especially for basements',
        'At least two independent contractor quotes — foundation cost estimates vary widely',
      ],
      prompt: 'Your land choice narrows this down — here are the options that fit it.',
      options: (choices) => {
        if (choices.site_terrain === 'sloped') {
          return [
            { id: 'walkout_basement', label: 'Walkout basement',
              pros: ['Turns the slope into usable, light-filled floor area'],
              cons: ['Most expensive sloped-lot option'] },
            { id: 'pier_stilt', label: 'Pier & beam / stilts',
              pros: ['Minimal excavation', 'Good for steep or unstable slopes'],
              cons: ['Under-house area often unusable without extra cost', 'More exposed structure to weatherproof'] },
            { id: 'stepped', label: 'Stepped foundation',
              pros: ['Follows the natural grade, less earth-moving than a flat pad'],
              cons: ['More complex formwork = more labor cost'] },
          ];
        }
        if (choices.site_terrain === 'waterfront') {
          return [
            { id: 'raised_pier', label: 'Raised pier / elevated slab',
              pros: ['Meets flood-elevation requirements', 'Airflow underneath reduces flood damage risk'],
              cons: ['Access (stairs/ramps) adds cost and design complexity'] },
          ];
        }
        // flat (default)
        return [
          { id: 'slab', label: 'Slab-on-grade',
            pros: ['Cheapest, fastest option', 'No crawlspace moisture issues'],
            cons: ['No easy access to under-floor plumbing/wiring later'] },
          { id: 'crawlspace', label: 'Crawlspace',
            pros: ['Cheap access to plumbing/wiring for future repairs'],
            cons: ['Needs ventilation/moisture control or it rots'] },
          { id: 'full_basement', label: 'Full basement',
            pros: ['Cheapest way to add a lot of floor area', 'Good storm shelter in relevant climates'],
            cons: ['Highest upfront cost of the flat-lot options', 'Waterproofing failure is expensive to fix later'] },
        ];
      },
    },
    {
      id: 'structural_system',
      category: 'Structure',
      title: 'Structural system',
      watchFor: [
        'Engineer span tables for your actual ceiling height and room-width goals, not a generic assumption',
        'Fire-rating requirements at your specific distance to the boundary',
        'Termite/pest treatment requirements for wood framing in your region',
        'Seismic zone requirements if applicable',
        'Material lead times — steel and some engineered products can take much longer to arrive than framing lumber',
      ],
      prompt: 'What will the frame of the house be built from?',
      options: [
        { id: 'wood_frame', label: 'Wood frame',
          pros: ['Cheapest, fastest, most contractors know it well'],
          cons: ['Less fire/pest resistance than masonry or steel'] },
        { id: 'steel_frame', label: 'Steel frame',
          pros: ['Long clear spans (great for open-plan)', 'Very durable, resists pests'],
          cons: ['More expensive, needs specialist labor'] },
        { id: 'masonry_concrete', label: 'Masonry / concrete',
          pros: ['Excellent thermal mass, fire resistance, longevity'],
          cons: ['Slowest and typically most expensive to build'] },
      ],
    },
    {
      id: 'floor_plan',
      category: 'Structure',
      title: 'Floor plan layout',
      watchFor: [
        'Minimum habitable room sizes required by your local code',
        'Natural light/ventilation minimums — many codes require a minimum window area as a % of floor area per room',
        'Fire egress path requirements from bedrooms and the overall plan',
        'Hallway and doorway width if accessibility/aging-in-place matters to you, now or later',
        'Minimum ceiling height requirements, especially in any split-level or basement space',
      ],
      prompt: (choices => `Given a ${choices.lot_context === 'urban' ? 'tight urban' : choices.lot_context === 'rural' ? 'spacious rural' : 'suburban'} lot, how should rooms be arranged?`),
      options: [
        { id: 'open_concept', label: 'Open-concept',
          pros: ['Feels bigger than it is', 'Great for entertaining and sightlines to kids'],
          cons: ['Noise and smells travel everywhere', 'Harder to zone heating/cooling efficiently'] },
        { id: 'zoned_traditional', label: 'Zoned / traditional rooms',
          pros: ['Privacy and noise separation', 'Easier to heat/cool only occupied rooms'],
          cons: ['Feels more compartmentalized', 'More interior walls = more cost'] },
        { id: 'split_level', label: 'Split-level / multi-level zoning',
          pros: ['Good for sloped lots or separating public/private areas vertically'],
          cons: ['Stairs everywhere — harder for accessibility/aging in place'] },
      ],
    },
    {
      id: 'room_layout_sunlight',
      category: 'Structure',
      title: 'Which rooms get the sun?',
      watchFor: [
        'Overlooking/privacy rules for windows facing directly into a neighbor\'s yard or windows',
        'Required solar access hours for main living areas under your local code, if any',
        'Window-to-floor-area ratio actually needed to make a passive-solar strategy work, not just "a big window"',
        'Glare timing for any room with a screen (TV, home office monitor) on the sun-facing side',
      ],
      prompt: (choices => {
        const facing = choices.orientation === 'south' ? 'south (your sunniest side)'
          : choices.orientation === 'north' ? 'north (your evenest, coolest side)'
          : 'east/west (your strongest morning or evening side)';
        return `Your main façade faces ${facing}. Where do you put the sun-facing rooms?`;
      }),
      options: [
        { id: 'living_forward', label: 'Living/kitchen get the sun-facing side',
          pros: ['Best daylight where the household spends the most waking hours'],
          cons: ['Bedrooms get less natural light and may feel darker'] },
        { id: 'bedrooms_forward', label: 'Bedrooms get the sun-facing side',
          pros: ['Warm, bright bedrooms — pleasant for morning-oriented households'],
          cons: ['Living spaces may need more artificial lighting during the day'] },
        { id: 'mixed_zoned', label: 'Split evenly, zoned by time-of-day use',
          pros: ['Balanced light distribution across the whole house'],
          cons: ['Requires more careful (and slightly more expensive) window planning'] },
      ],
    },

    // ---------------- ENVELOPE ----------------
    {
      id: 'roof_type',
      category: 'Envelope',
      title: 'Roof type',
      watchFor: [
        'Maximum roof height controls in your zoning rules',
        'Wind uplift rating required for your region',
        'Snow-load engineering certificate if you\'re in a cold/snow climate',
        'Gutter and downpipe capacity calculated for your actual roof area, not a generic size',
        'Fire-rating requirements at the roof junction if the house is close to a boundary',
      ],
      prompt: 'Which roof shape fits your climate and style?',
      options: (choices) => {
        const cold = choices.climate === 'cold_snow';
        return [
          { id: 'gable', label: 'Gable (triangular)',
            pros: ['Cheap, simple, sheds water/snow well'],
            cons: ['Less usable attic headroom at the edges'] },
          { id: 'hip', label: 'Hip (slopes on all sides)',
            pros: ['Very stable in high wind', 'Sheds water on every side'],
            cons: ['More complex framing = higher cost than gable'] },
          { id: 'shed_mono', label: 'Shed / mono-pitch',
            pros: ['Modern look, simple to build, great for solar panel angling'],
            cons: cold ? ['Snow sheds hard to one side — needs careful gutter/drift planning'] : ['Less traditional attic storage space'] },
          { id: 'flat', label: 'Flat / low-slope',
            pros: ['Usable roof deck / rooftop garden potential'],
            cons: cold
              ? ['Snow load risk is a real structural concern — needs extra engineering', 'Poor drainage risk without careful detailing']
              : ['Needs meticulous waterproofing — leaks are the #1 flat-roof complaint'] },
        ];
      },
    },
    {
      id: 'roof_pitch',
      category: 'Envelope',
      title: 'Roof pitch (steepness)',
      showIf: (choices) => choices.roof_type !== 'flat',
      watchFor: [
        'Minimum pitch required by your chosen roofing material\'s manufacturer specs (metal and tile have different minimums)',
        'Attic ventilation requirements at your chosen pitch',
        'Solar panel install angle efficiency if panels are in your future plans',
        'Gutter overflow provisions for heavy-rain events',
      ],
      prompt: 'How steep should it be?',
      options: [
        { id: 'steep', label: 'Steep pitch',
          pros: ['Sheds snow/rain fastest', 'Opens up attic or loft space'],
          cons: ['More roofing material = higher cost'] },
        { id: 'moderate', label: 'Moderate pitch',
          pros: ['Balanced cost vs. drainage performance'],
          cons: ['A middle-of-the-road compromise on both fronts'] },
        { id: 'low', label: 'Low pitch',
          pros: ['Cheapest, least roofing material', 'Lower, sleeker profile'],
          cons: ['Sheds snow/rain more slowly — riskier in wet/snowy climates'] },
      ],
    },
    {
      id: 'wall_structure_material',
      category: 'Envelope',
      title: 'Exterior wall build-up',
      watchFor: [
        'Thermal bridging detailing sign-off from whoever certifies your energy rating',
        'Acoustic/party-wall rating if this wall is shared or close to a neighbor',
        'Fire separation distance required at your specific boundary distance',
        'Vapor barrier placement — wrong side for your climate causes hidden rot',
        'Structural engineer certification specific to the system you pick (SIP/ICF suppliers usually require this)',
      ],
      prompt: 'What\'s the wall assembly behind the finish?',
      options: [
        { id: 'standard_frame', label: 'Standard framed wall + batt insulation',
          pros: ['Cheapest, most contractors know it'],
          cons: ['Thermal bridging at every stud unless detailed carefully'] },
        { id: 'sip_panel', label: 'Structural Insulated Panels (SIPs)',
          pros: ['Very airtight, fast to erect, strong'],
          cons: ['Higher material cost', 'Harder to modify once built'] },
        { id: 'icf', label: 'Insulated Concrete Forms (ICF)',
          pros: ['Excellent insulation + sound + fire resistance'],
          cons: ['Most expensive wall system here'] },
      ],
    },
    {
      id: 'exterior_cladding',
      category: 'Envelope',
      title: 'Exterior cladding / finish',
      watchFor: [
        'Bushfire attack level (BAL) rating compliance if that applies to your site',
        'Maintenance access clearance from the ground (rot/pest risk if cladding sits too low)',
        'Installer certification and written warranty terms — many claddings void warranty without certified installation',
        'Color or material restrictions from any heritage/HOA overlay',
        'Expansion joint requirements for the specific material and climate',
      ],
      prompt: 'What\'s the visible skin of the house?',
      options: [
        { id: 'wood_siding', label: 'Wood siding',
          pros: ['Warm, classic look', 'Repairable in sections'],
          cons: ['Needs repainting/staining maintenance every few years'] },
        { id: 'brick_veneer', label: 'Brick veneer',
          pros: ['Very low maintenance', 'Long lifespan'],
          cons: ['Higher upfront cost', 'Heavier — needs foundation to account for it'] },
        { id: 'stucco', label: 'Stucco',
          pros: ['Good fit for hot/dry climates', 'Seamless modern look'],
          cons: ['Prone to cracking in freeze-thaw climates'] },
        { id: 'fiber_cement', label: 'Fiber cement board',
          pros: ['Low maintenance', 'Fire resistant', 'Mimics wood look at lower cost'],
          cons: ['Heavier and more brittle to install than vinyl or wood'] },
      ],
    },
    {
      id: 'window_glazing',
      category: 'Envelope',
      title: 'Window & glazing strategy',
      watchFor: [
        'Window energy rating (U-value/SHGC) required by code for your climate zone',
        'Safety glazing requirements near doors, low sills, and wet areas',
        'Minimum egress window size for bedrooms (fire escape requirement, not just style)',
        'Overshadowing/privacy impact on and from neighboring windows',
        'Condensation risk with high-performance glazing in humid climates — ventilation needs to keep pace',
      ],
      prompt: (choices => {
        const sunny = choices.orientation === 'south';
        return sunny
          ? 'Your south-facing wall can gain real passive solar heat — how much glass do you want to commit to that?'
          : 'How much glass, and how high-performance, do you want your windows to be?';
      }),
      options: [
        { id: 'large_solar_glazing', label: 'Large sun-facing glazing (passive solar)',
          pros: ['Free heat and daylight in cold months', 'Dramatic, bright interior'],
          cons: ['Needs overhangs/shading or it overheats in summer', 'More expensive high-performance glass required'] },
        { id: 'balanced_shaded', label: 'Balanced, moderately sized, shaded windows',
          pros: ['Predictable comfort year-round', 'Cheaper than a full glazing strategy'],
          cons: ['Less dramatic light/views than a glass-forward design'] },
        { id: 'high_performance_small', label: 'Small, high-performance (triple-glazed) windows',
          pros: ['Best energy performance per window', 'Great for extreme climates'],
          cons: ['Less daylight and views per dollar spent'] },
      ],
    },

    // ---------------- SYSTEMS ----------------
    {
      id: 'insulation_envelope',
      category: 'Systems',
      title: 'Insulation target',
      watchFor: [
        'Minimum R-value required by code for your specific climate zone',
        'Vapor barrier placement — the correct side depends on climate, and getting it backwards causes hidden rot',
        'Continuous insulation vs. gaps at structural members (a common source of real-world underperformance)',
        'Blower-door/air-tightness test requirement at higher performance tiers',
        'Mechanical ventilation (HRV/ERV) becomes necessary once the house gets tight — factor it into the systems step next',
      ],
      prompt: (choices => `For a ${choices.climate ? choices.climate.replace('_',' ') : 'your'} climate, how far do you push the insulation envelope?`),
      options: [
        { id: 'code_min', label: 'Code-minimum',
          pros: ['Cheapest upfront cost'],
          cons: ['Highest lifetime energy bills of the three options'] },
        { id: 'high_performance', label: 'High-performance (above code)',
          pros: ['Meaningfully lower energy bills', 'More comfortable in extreme weeks'],
          cons: ['Noticeable upfront cost premium'] },
        { id: 'passive_house', label: 'Passive-house / net-zero-ready',
          pros: ['Near-zero heating/cooling bills', 'Future-proofs against energy price rises'],
          cons: ['Highest upfront cost', 'Requires an experienced, specialized builder'] },
      ],
    },
    {
      id: 'hvac_system',
      category: 'Systems',
      title: 'Heating & cooling system',
      watchFor: [
        'Proper equipment sizing via a real load calculation (e.g. Manual J) — not a ballpark rule of thumb, which usually oversizes',
        'Electrical panel capacity for a heat pump or any future electrification',
        'Outdoor condenser unit noise setback distance from bedrooms and neighboring windows',
        'Ventilation/makeup air requirements if the building envelope is airtight',
        'Duct or refrigerant line routing clearances through the structure you already chose',
      ],
      prompt: 'How do you want to heat and cool the house?',
      options: (choices) => {
        const cold = choices.climate === 'cold_snow';
        return [
          { id: 'forced_air', label: 'Forced-air furnace + central AC',
            pros: ['Familiar, widely serviceable technology'],
            cons: ['Ductwork loses efficiency and takes up space'] },
          { id: 'heat_pump', label: 'Heat pump (air or ground source)',
            pros: ['Very efficient heating and cooling from one system'],
            cons: cold ? ['Cold-climate models cost more and need backup heat on the coldest days'] : ['Higher upfront cost than a basic furnace'] },
          { id: 'radiant_minisplit', label: 'Radiant floor heat + ductless mini-splits',
            pros: ['Very even, quiet comfort', 'No ductwork to lose space to'],
            cons: ['No central air distribution — cooling handled room-by-room'] },
        ];
      },
    },
    {
      id: 'plumbing_electrical',
      category: 'Systems',
      title: 'Plumbing & electrical rough-in',
      watchFor: [
        'Local code minimum outlet/circuit counts per room',
        'Main switchboard capacity for a future EV charger or solar inverter',
        'Water pressure and backflow prevention requirements',
        'Sewer vent stack routing through the roof you already chose',
        'Pre-wire conduit for future smart-home/automation — this is your last cheap chance before walls close up',
      ],
      prompt: 'How do you want to lay out the wet walls and power?',
      options: [
        { id: 'centralized', label: 'Centralized wet wall (bathrooms/kitchen stacked)',
          pros: ['Cheapest plumbing run', 'Shortest pipe runs = less heat/pressure loss'],
          cons: ['Locks the floor plan — hard to move a bathroom later'] },
        { id: 'distributed', label: 'Distributed plumbing to fit the ideal layout',
          pros: ['Rooms go wherever the design wants them to go'],
          cons: ['Longer pipe runs cost more and can mean slower hot water'] },
        { id: 'smart_prewire', label: 'Standard plumbing + smart-home electrical pre-wire',
          pros: ['Future-proofs for automation/EV charging/solar without opening walls later'],
          cons: ['Added upfront electrical cost for capacity you may not use immediately'] },
      ],
    },

    // ---------------- PLANNING (WRAP-UP) ----------------
    {
      id: 'budget_contingency',
      category: 'Planning',
      title: 'Budget approach',
      watchFor: [
        'At least 2–3 independent quotes before committing to any approach',
        'What\'s actually included vs. an "allowance" in each quote — allowances are the most common source of budget blowouts',
        'Payment schedule tied to construction milestones, not calendar dates',
        'Retention/holdback clause protecting you until defects are fixed',
        'Contractor license, insurance, and warranty coverage verified directly with the issuing body, not just taken on their word',
      ],
      prompt: 'Last brick: how do you want to handle the budget as reality meets the plan?',
      options: [
        { id: 'fixed_cap', label: 'Fixed hard cap',
          pros: ['Forces discipline — you will not overspend'],
          cons: ['Something usually has to be cut when the unexpected happens'] },
        { id: 'contingency', label: 'Budget + 10–20% contingency',
          pros: ['Realistic buffer for the inevitable surprise', 'Most experienced builders recommend this'],
          cons: ['Requires having that extra 10–20% available at all'] },
        { id: 'phased', label: 'Phased build (core now, finish later)',
          pros: ['Lower cash needed to move in', 'Spreads cost over time'],
          cons: ['Living through a second construction phase later', 'Some systems cost more to retrofit than to do once'] },
      ],
    },
  ],
});
