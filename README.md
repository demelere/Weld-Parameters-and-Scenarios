# Weld-Parameters-and-Scenarios

There's a lot of upside in training videos.  One example is Steve Bleile's Arc Welding videos for SMAW (i.e. stick welding).  There are a lots interplay between welding parameters, scenarios, and requirements that go into making decisions and adjusting (both beforehand and in real-time) to controlling the molten weld puddle and producing a good weld bead. 

This is an effort to encode that knowledge as a data structure that could be used and accessed w/algorithms for a human to visualize and understand at-a-glance what to do in any given situation, and for robotic controls and decision-making.

WeldingKnowledgeGraph
├── Preparations (Static Decisions)
│   ├── Materials
│   │   ├── BaseMetalProperties
│   │   └── JointConfigurations
│   ├── Equipment
│   │   ├── MachineTypes
│   │   └── Accessories
│   └── Electrodes
│       ├── Types
│       └── Characteristics
├── Techniques (Dynamic Adjustments)
│   ├── PositionSpecificTechniques
│   ├── MovementPatterns
│   └── ArcManipulation
└── Observations (Feedback Loop)
    ├── PuddleIndicators
    └── QualityAssessment