// Welding Knowledge Visualization with Three.js
// This implementation creates an interactive 3D graph visualization
// of welding parameters, relationships, and recommendations

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

// WELDING KNOWLEDGE BASE
// Structured data from Steve Bleile's videos
const weldingKnowledge = {
  electrodes: {
    "E6010": {
      current: "DC+",
      penetration: "Deep",
      slag: "Light, fast-freeze",
      positions: ["Flat", "Horizontal", "Vertical Up", "Vertical Down", "Overhead"],
      bestUse: "Root passes, dirty metal, repair work",
      tensileStrength: "60,000 psi",
      arcForce: "Strong",
      puddleVisibility: "Excellent",
      techniqueOptions: ["Circular", "Zigzag", "Whip/Step"]
    },
    "E6011": {
      current: "AC or DC+",
      penetration: "Deep",
      slag: "Light, fast-freeze",
      positions: ["Flat", "Horizontal", "Vertical Up", "Vertical Down", "Overhead"],
      bestUse: "Similar to 6010 but works on AC",
      tensileStrength: "60,000 psi",
      arcForce: "Strong",
      puddleVisibility: "Excellent",
      techniqueOptions: ["Circular", "Zigzag", "Whip/Step"]
    },
    "E6013": {
      current: "AC, DC+ or DC-",
      penetration: "Moderate",
      slag: "Medium",
      positions: ["Flat", "Horizontal", "Vertical Up", "Vertical Down", "Overhead"],
      bestUse: "General purpose, sheet metal, easier to use",
      tensileStrength: "60,000 psi",
      arcForce: "Mild",
      puddleVisibility: "Partial (top edge covered)",
      techniqueOptions: ["Straight", "Slight side-to-side"]
    },
    "E7018": {
      current: "AC or DC+",
      penetration: "Moderate",
      slag: "Heavy with iron powder",
      positions: ["Flat", "Horizontal", "Vertical Up", "Overhead"],
      bestUse: "High quality, low hydrogen, stress applications",
      tensileStrength: "70,000 psi",
      arcForce: "Mild",
      puddleVisibility: "Limited (mostly covered by slag)",
      techniqueOptions: ["Straight", "Side-to-side"]
    },
    "E7024": {
      current: "AC or DC+",
      penetration: "Shallow",
      slag: "Very heavy",
      positions: ["Flat", "Horizontal fillet"],
      bestUse: "High deposition rate, flat work",
      tensileStrength: "70,000 psi",
      arcForce: "Mild",
      puddleVisibility: "Limited",
      techniqueOptions: ["Straight"]
    }
  },
  
  electrodeSize: {
    "3/32\"": {
      amperage: {
        "E6010": "40-80A",
        "E6011": "40-80A",
        "E6013": "40-80A",
        "E7018": "65-110A",
        "E7024": "100-145A"
      },
      control: "Excellent",
      deposition: "Low",
      bestFor: "Thin metal, out-of-position, root passes"
    },
    "1/8\"": {
      amperage: {
        "E6010": "75-130A",
        "E6011": "75-130A",
        "E6013": "70-110A",
        "E7018": "100-150A",
        "E7024": "140-190A"
      },
      control: "Good",
      deposition: "Medium",
      bestFor: "General purpose, most common size"
    },
    "5/32\"": {
      amperage: {
        "E6010": "110-170A",
        "E6011": "100-160A",
        "E6013": "110-160A",
        "E7018": "140-215A",
        "E7024": "180-250A"
      },
      control: "Fair",
      deposition: "High",
      bestFor: "Thicker metal, flat position, filling passes"
    }
  },
  
  positions: {
    "Flat": {
      gravity: "Helps control puddle",
      amperage: "Standard/high range",
      techniques: "All techniques viable",
      challenges: "Minimal",
      rodAngle: "45-90° from horizontal"
    },
    "Horizontal": {
      gravity: "Causes puddle to sag downward",
      amperage: "Standard range",
      techniques: "Control puddle with angle and speed",
      challenges: "Preventing excessive buildup on bottom",
      rodAngle: "Point up slightly, nearly perpendicular to weld"
    },
    "Vertical Down": {
      gravity: "Pulls puddle in direction of travel",
      amperage: "Standard/slightly higher",
      techniques: "Fast travel, control with angle",
      challenges: "Ensuring adequate penetration",
      rodAngle: "Angle up slightly"
    },
    "Vertical Up": {
      gravity: "Pulls puddle against direction of travel",
      amperage: "Slightly lower",
      techniques: "Side-to-side, step, or weave",
      challenges: "Preventing puddle fallout",
      rodAngle: "Angle up to prevent blowout"
    },
    "Overhead": {
      gravity: "Pulls puddle away from workpiece",
      amperage: "Standard range",
      techniques: "Short arc, consistent motion",
      challenges: "Keeping puddle in place, spatter",
      rodAngle: "Nearly perpendicular, slight angle into travel"
    }
  },
  
  metalThickness: {
    "Thin (<1/8\")": {
      amperage: "Lower end of range",
      penetration: "Watch for burn-through",
      heatDissipation: "Quick to overheat",
      rodSelection: "Smaller diameter",
      technique: "Fast travel, possibly vertical down"
    },
    "Medium (1/8\"-3/16\")": {
      amperage: "Mid-range",
      penetration: "Good balance available",
      heatDissipation: "Moderate",
      rodSelection: "Standard 1/8\" works well",
      technique: "Standard approach for position"
    },
    "Thick (>3/16\")": {
      amperage: "Upper range",
      penetration: "May require beveling/multiple passes",
      heatDissipation: "Slow, acts as heat sink",
      rodSelection: "Larger diameter advantageous",
      technique: "Slower travel, possible weave"
    }
  },
  
  jointTypes: {
    "Butt": {
      preparation: "Square edges or beveled for thick metal",
      penetration: "Critical for strength",
      technique: "Focus on root fusion",
      commonIssues: "Burn-through, lack of penetration",
      rodAngle: "Nearly perpendicular"
    },
    "Lap": {
      preparation: "Clean mating surfaces",
      penetration: "Focus on fusing to bottom piece",
      technique: "Balance heat between pieces",
      commonIssues: "Insufficient fusion to bottom piece",
      rodAngle: "45° pointing into corner"
    },
    "T": {
      preparation: "Clean mating surfaces",
      penetration: "Focus on root fusion",
      technique: "Angle to balance heat",
      commonIssues: "Lack of fusion at root",
      rodAngle: "45° pointing into corner"
    },
    "Corner": {
      preparation: "Can be open or closed corner",
      penetration: "Must reach inner corner",
      technique: "Balance heat between pieces",
      commonIssues: "Inside corner penetration",
      rodAngle: "Bisect the angle"
    }
  },
  
  // Dynamic factors - adjustable during welding
  techniques: {
    "arcGap": {
      "Short": {
        effect: "More direct heat, deeper penetration",
        puddle: "Less fluid, more directed",
        suitable: "Root passes, harder to reach spots",
        appearance: "Narrower bead, higher crown"
      },
      "Medium": {
        effect: "Balanced heat distribution",
        puddle: "Moderate fluidity and spread",
        suitable: "General purpose",
        appearance: "Even bead formation"
      },
      "Long": {
        effect: "More distributed heat, less penetration",
        puddle: "More fluid, wider spread",
        suitable: "Thin metals, wider coverage",
        appearance: "Flatter, wider bead"
      }
    },
    
    "travelSpeed": {
      "Slow": {
        effect: "More heat input to base metal",
        puddle: "Wider, more fluid",
        suitable: "Thick metal, needs preheat",
        issues: "Excessive build-up, potential burn-through"
      },
      "Medium": {
        effect: "Balanced heat input",
        puddle: "Controlled spread and fluidity",
        suitable: "Most general welding",
        issues: "Minimal if other parameters balanced"
      },
      "Fast": {
        effect: "Less heat input, quicker cooling",
        puddle: "Narrower, less fluid",
        suitable: "Thin metals, vertical down",
        issues: "Potential lack of fusion, undercut"
      }
    },
    
    "rodAngle": {
      "Perpendicular": {
        effect: "Maximum penetration, less build-up",
        puddle: "Penetrates deeper, spreads wider",
        suitable: "Root passes, butt joints, flat position",
        appearance: "Flatter bead profile"
      },
      "45°": {
        effect: "Balanced penetration and build-up",
        puddle: "Moderate penetration and stacking",
        suitable: "General purpose, fillet welds",
        appearance: "Moderate crown"
      },
      "Shallow": {
        effect: "Less penetration, more build-up",
        puddle: "Stacks more, penetrates less",
        suitable: "Fill passes, building up metal",
        appearance: "Higher crown, potentially less fusion"
      }
    },
    
    "motionPattern": {
      "Straight": {
        effect: "Consistent heat input, uniform bead",
        puddle: "Even, predictable formation",
        suitable: "Simple joints, production work, E7018/E7024",
        appearance: "Even, uniform bead"
      },
      "Circular": {
        effect: "Controls puddle width, moderate heat",
        puddle: "Contained spread, good edge tie-in",
        suitable: "General purpose, all positions",
        appearance: "Slightly scalloped edges"
      },
      "Zigzag": {
        effect: "Wider heat distribution, good control",
        puddle: "Wider bead, controlled fluidity",
        suitable: "Wider joints, good edge tie-in",
        appearance: "Wide bead with even edges"
      },
      "Whip/Step": {
        effect: "Controls heat input, cools between steps",
        puddle: "Solidifies between movements",
        suitable: "E6010/E6011, vertical, poor fit-up",
        appearance: "Distinct ripple pattern"
      }
    }
  },
  
  // Observable feedback during welding
  observables: {
    "puddleFluid": {
      "Stiff": {
        diagnosis: "Insufficient heat",
        causes: ["Amperage too low", "Travel too fast", "Arc too short"],
        adjustments: ["Increase amperage", "Slow travel speed", "Lengthen arc slightly"]
      },
      "Moderate": {
        diagnosis: "Proper heat input",
        causes: ["Parameters balanced"],
        adjustments: ["Maintain settings"]
      },
      "VeryFluid": {
        diagnosis: "Excessive heat",
        causes: ["Amperage too high", "Travel too slow", "Arc too long"],
        adjustments: ["Decrease amperage", "Increase travel speed", "Shorten arc"]
      }
    },
    
    "puddleSpread": {
      "Narrow": {
        diagnosis: "Insufficient heat or distribution",
        causes: ["Amperage too low", "Travel too fast", "Angle too shallow"],
        adjustments: ["Increase amperage", "Slow travel", "Adjust to more perpendicular angle"]
      },
      "Moderate": {
        diagnosis: "Good heat distribution",
        causes: ["Parameters balanced"],
        adjustments: ["Maintain settings"]
      },
      "Wide": {
        diagnosis: "Excessive heat input",
        causes: ["Amperage too high", "Travel too slow", "Angle too perpendicular for application"],
        adjustments: ["Decrease amperage", "Speed up travel", "Adjust angle"]
      }
    },
    
    "edgeTie": {
      "Poor": {
        diagnosis: "Inadequate fusion at edges",
        causes: ["Insufficient heat at edges", "Travel too fast", "Poor angle"],
        adjustments: ["Adjust angle to direct more heat to edges", "Slow travel", "Weave slightly"]
      },
      "Adequate": {
        diagnosis: "Sufficient edge fusion",
        causes: ["Heat distribution adequate"],
        adjustments: ["Maintain settings"]
      },
      "Excellent": {
        diagnosis: "Perfect edge fusion",
        causes: ["Ideal parameter balance"],
        adjustments: ["Maintain settings"]
      }
    },
    
    "arcStability": {
      "Unstable": {
        diagnosis: "Poor arc control",
        causes: ["Wrong current type for electrode", "Inconsistent arc gap", "Damaged coating"],
        adjustments: ["Check polarity", "Maintain steady hand", "Check electrode condition"]
      },
      "Stable": {
        diagnosis: "Good arc control",
        causes: ["Correct parameters"],
        adjustments: ["Maintain settings"]
      }
    }
  },
  
  // Recommendation logic
  getRecommendations: function(inputs) {
    // Input parameters
    const {
      electrode,
      electrodeSize,
      position,
      metalThickness,
      jointType,
      machineType,
      observedPuddle = "Moderate",
      observedSpread = "Moderate",
      observedTieIn = "Adequate",
      observedStability = "Stable"
    } = inputs;
    
    // Initialize recommendations
    const recommendations = {
      amperage: "",
      arcGap: "",
      rodAngle: "",
      travelSpeed: "",
      motionPattern: [],
      adjustments: []
    };
    
    // Get electrode data
    const electrodeData = this.electrodes[electrode];
    const sizeData = this.electrodeSize[electrodeSize];
    const positionData = this.positions[position];
    const thicknessData = this.metalThickness[metalThickness];
    const jointData = this.jointTypes[jointType];
    
    // Calculate base amperage range
    if (sizeData && sizeData.amperage[electrode]) {
      let [min, max] = sizeData.amperage[electrode].split('-').map(a => parseInt(a));
      
      // Adjust for metal thickness
      if (metalThickness === "Thin (<1/8\")") {
        max = min + (max - min) * 0.4; // Lower part of range
      } else if (metalThickness === "Thick (>3/16\")") {
        min = min + (max - min) * 0.6; // Upper part of range
      }
      
      // Adjust for position
      if (position === "Vertical Up") {
        max -= 5; // Slightly lower for vertical up
      } else if (position === "Overhead") {
        max -= 3; // Slightly lower for overhead
      }
      
      recommendations.amperage = `${Math.round(min)}-${Math.round(max)}A`;
    }
    
    // Rod angle recommendation
    if (jointType === "Butt") {
      recommendations.rodAngle = position === "Flat" ? "Perpendicular" : 
                                 position === "Vertical Up" ? "45° angled up slightly" :
                                 position === "Overhead" ? "Nearly perpendicular" : "45°";
    } else if (jointType === "Lap" || jointType === "T") {
      recommendations.rodAngle = "45° into corner";
    } else if (jointType === "Corner") {
      recommendations.rodAngle = "Bisect the corner angle";
    }
    
    // Position-specific adjustments
    if (position === "Vertical Down") {
      recommendations.travelSpeed = "Fast";
      recommendations.rodAngle = "Angle up slightly to hold puddle";
    } else if (position === "Vertical Up") {
      recommendations.travelSpeed = "Medium-slow, steady";
      if (electrode === "E7018") {
        recommendations.motionPattern.push("Side-to-side");
      } else if (electrode === "E6010" || electrode === "E6011") {
        recommendations.motionPattern.push("Step/Whip");
        recommendations.motionPattern.push("Circular");
      }
    } else if (position === "Horizontal") {
      recommendations.rodAngle = "Angle up slightly to control puddle";
      recommendations.travelSpeed = "Medium-fast to prevent sagging";
    }
    
    // Electrode-specific recommendations
    if (electrode === "E6010" || electrode === "E6011") {
      recommendations.arcGap = "Medium";
      if (!recommendations.motionPattern.length) {
        recommendations.motionPattern.push("Circular", "Zigzag", "Whip/Step");
      }
    } else if (electrode === "E6013") {
      recommendations.arcGap = "Short to medium";
      if (!recommendations.motionPattern.length) {
        recommendations.motionPattern.push("Straight", "Slight side-to-side");
      }
    } else if (electrode === "E7018") {
      recommendations.arcGap = "Short";
      recommendations.adjustments.push("Keep arc in puddle, don't let slag get ahead");
      if (!recommendations.motionPattern.length) {
        recommendations.motionPattern.push("Straight", "Side-to-side");
      }
    } else if (electrode === "E7024") {
      recommendations.arcGap = "Short";
      recommendations.motionPattern.push("Straight");
    }
    
    // Adjust based on observed puddle behavior
    if (observedPuddle === "Stiff") {
      recommendations.adjustments.push("Increase heat: try higher amperage or slower travel");
    } else if (observedPuddle === "VeryFluid") {
      recommendations.adjustments.push("Reduce heat: try lower amperage or faster travel");
    }
    
    if (observedSpread === "Narrow") {
      recommendations.adjustments.push("Widen puddle: slow down slightly or increase amperage");
    } else if (observedSpread === "Wide") {
      recommendations.adjustments.push("Narrow puddle: speed up slightly or decrease amperage");
    }
    
    if (observedTieIn === "Poor") {
      recommendations.adjustments.push("Improve edge tie-in: direct more heat to edges, adjust angle");
    }
    
    if (observedStability === "Unstable") {
      if (electrode === "E6010" && machineType === "AC") {
        recommendations.adjustments.push("E6010 requires DC+, switch to E6011 for AC");
      } else {
        recommendations.adjustments.push("Maintain consistent arc length, check machine settings");
      }
    }
    
    return recommendations;
  }
};

// THREE.JS VISUALIZATION
class WeldingKnowledgeVisualization {
  constructor(containerElement) {
    this.container = containerElement;
    this.weldingKnowledge = weldingKnowledge;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.labelRenderer = null;
    this.controls = null;
    this.gui = null;
    this.nodeObjects = {};
    this.relationshipLines = [];
    this.currentRecommendations = {};
    
    // Input parameters
    this.params = {
      electrode: "E6010",
      electrodeSize: "1/8\"",
      position: "Flat",
      metalThickness: "Medium (1/8\"-3/16\")",
      jointType: "Butt",
      machineType: "DC+",
      observedPuddle: "Moderate",
      observedSpread: "Moderate",
      observedTieIn: "Adequate",
      observedStability: "Stable"
    };
    
    this.init();
  }
  
  init() {
    this.setupScene();
    this.setupGUI();
    this.createKnowledgeGraph();
    this.animate();
    this.updateRecommendations();
  }
  
  setupScene() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60, this.container.clientWidth / this.container.clientHeight, 0.1, 1000
    );
    this.camera.position.set(0, 0, 30);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);
    
    // Label renderer for HTML elements
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0px';
    this.container.appendChild(this.labelRenderer.domElement);
    
    // Controls
    this.controls = new OrbitControls(this.camera, this.labelRenderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });
  }
  
  setupGUI() {
    this.gui = new GUI({ width: 300 });
    
    // Input parameters folder
    const inputFolder = this.gui.addFolder('Welding Parameters');
    
    inputFolder.add(this.params, 'electrode', Object.keys(this.weldingKnowledge.electrodes))
      .name('Electrode Type')
      .onChange(() => this.updateRecommendations());
      
    inputFolder.add(this.params, 'electrodeSize', Object.keys(this.weldingKnowledge.electrodeSize))
      .name('Electrode Size')
      .onChange(() => this.updateRecommendations());
      
    inputFolder.add(this.params, 'position', Object.keys(this.weldingKnowledge.positions))
      .name('Weld Position')
      .onChange(() => this.updateRecommendations());
      
    inputFolder.add(this.params, 'metalThickness', Object.keys(this.weldingKnowledge.metalThickness))
      .name('Metal Thickness')
      .onChange(() => this.updateRecommendations());
      
    inputFolder.add(this.params, 'jointType', Object.keys(this.weldingKnowledge.jointTypes))
      .name('Joint Type')
      .onChange(() => this.updateRecommendations());
      
    inputFolder.add(this.params, 'machineType', ['AC', 'DC+', 'DC-'])
      .name('Machine Type')
      .onChange(() => this.updateRecommendations());
    
    inputFolder.open();
    
    // Observable feedback folder
    const observableFolder = this.gui.addFolder('Real-time Observations');
    
    observableFolder.add(this.params, 'observedPuddle', ['Stiff', 'Moderate', 'VeryFluid'])
      .name('Puddle Fluidity')
      .onChange(() => this.updateRecommendations());
      
    observableFolder.add(this.params, 'observedSpread', ['Narrow', 'Moderate', 'Wide'])
      .name('Puddle Spread')
      .onChange(() => this.updateRecommendations());
      
    observableFolder.add(this.params, 'observedTieIn', ['Poor', 'Adequate', 'Excellent'])
      .name('Edge Tie-in')
      .onChange(() => this.updateRecommendations());
      
    observableFolder.add(this.params, 'observedStability', ['Unstable', 'Stable'])
      .name('Arc Stability')
      .onChange(() => this.updateRecommendations());
    
    observableFolder.open();
    
    // Create recommendations display element
    this.recommendationsElement = document.createElement('div');
    this.recommendationsElement.style.position = 'absolute';
    this.recommendationsElement.style.bottom = '10px';
    this.recommendationsElement.style.left = '10px';
    this.recommendationsElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
    this.recommendationsElement.style.color = 'white';
    this.recommendationsElement.style.padding = '15px';
    this.recommendationsElement.style.borderRadius = '5px';
    this.recommendationsElement.style.maxWidth = '400px';
    this.recommendationsElement.style.fontFamily = 'Arial, sans-serif';
    this.container.appendChild(this.recommendationsElement);
  }
  
  createKnowledgeGraph() {
    this.clearGraph();
    
    // Create central node for current parameters
    const centralNode = this.createNode(0, 0, 0, 0x3498db, 'Current Settings');
    this.nodeObjects.central = centralNode;
    
    // Create category nodes around central node
    const categories = [
      { name: 'Electrode', color: 0xe74c3c },
      { name: 'Position', color: 0x2ecc71 },
      { name: 'Metal', color: 0xf39c12 },
      { name: 'Joint', color: 0x9b59b6 },
      { name: 'Technique', color: 0x1abc9c }
    ];
    
    const radius = 8;
    categories.forEach((cat, i) => {
      const angle = (i / categories.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const node = this.createNode(x, y, 0, cat.color, cat.name);
      this.nodeObjects[cat.name.toLowerCase()] = node;
      this.createRelationship(centralNode, node);
    });
    
    // Add electrode type nodes
    const electrodeNode = this.nodeObjects.electrode;
    const selectedElectrode = this.weldingKnowledge.electrodes[this.params.electrode];
    
    if (selectedElectrode) {
      // Create nodes for electrode properties
      const properties = [
        { name: 'Current: ' + selectedElectrode.current, key: 'current' },
        { name: 'Penetration: ' + selectedElectrode.penetration, key: 'penetration' },
        { name: 'Positions: ' + selectedElectrode.positions.length, key: 'positions' },
        { name: 'Arc Force: ' + selectedElectrode.arcForce, key: 'arcForce' },
        { name: 'Puddle Vis: ' + selectedElectrode.puddleVisibility, key: 'puddleVisibility' }
      ];
      
      this.createSubNodes(electrodeNode, properties, 0xe74c3c, 5, 0);
    }
    
    // Add position nodes
    const positionNode = this.nodeObjects.position;
    const selectedPosition = this.weldingKnowledge.positions[this.params.position];
    
    if (selectedPosition) {
      const properties = [
        { name: 'Rod Angle: ' + selectedPosition.rodAngle, key: 'rodAngle' },
        { name: 'Challenges: ' + selectedPosition.challenges, key: 'challenges' },
        { name: 'Techniques: ' + selectedPosition.techniques, key: 'techniques' }
      ];
      
      this.createSubNodes(positionNode, properties, 0x2ecc71, 5, Math.PI/2);
    }
    
    // Add metal nodes
    const metalNode = this.nodeObjects.metal;
    const selectedThickness = this.weldingKnowledge.metalThickness[this.params.metalThickness];
    
    if (selectedThickness) {
      const properties = [
        { name: 'Recommended A: ' + selectedThickness.amperage, key: 'amperage' },
        { name: 'Heat: ' + selectedThickness.heatDissipation, key: 'heatDissipation' },
        { name: 'Rod: ' + selectedThickness.rodSelection, key: 'rodSelection' }
      ];
      
      this.createSubNodes(metalNode, properties, 0xf39c12, 5, Math.PI);
    }
    
    // Add joint nodes
    const jointNode = this.nodeObjects.joint;
    const selectedJoint = this.weldingKnowledge.jointTypes[this.params.jointType];
    
    if (selectedJoint) {
      const properties = [
        { name: 'Prep: ' + selectedJoint.preparation, key: 'preparation' },
        { name: 'Focus: ' + selectedJoint.penetration, key: 'penetration' },
        { name: 'Rod Angle: ' + selectedJoint.rodAngle, key: 'rodAngle' }
      ];
      
      this.createSubNodes(jointNode, properties, 0x9b59b6, 5, Math.PI * 3/2);
    }
    
    // Add technique nodes
    const techniqueNode = this.nodeObjects.technique;
    // Create nodes for adjustable parameters during welding
    const techniques = [
      { name: 'Arc Gap', key: 'arcGap' },
      { name: 'Rod Angle', key: 'rodAngle' },
      { name: 'Travel Speed', key: 'travelSpeed' },
      { name: 'Motion Pattern', key: 'motionPattern' }
    ];
    
    this.createSubNodes(techniqueNode, techniques, 0x1abc9c, 5, Math.PI * 2);
    
    // Highlight nodes based on recommendations
    this.highlightRecommendedNodes();
  }
  
  createNode(x, y, z, color, label) {
    // Create sphere for node
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ 
      color: color,
      metalness: 0.3,
      roughness: 0.4,
      emissive: color,
      emissiveIntensity: 0.2
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);
    this.scene.add(sphere);
    
    // Add glow effect
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        'c': { value: 0.1 },
        'p': { value: 1.2 },
        glowColor: { value: new THREE.Color(color) },
        viewVector: { value: new THREE.Vector3() }
      },
      vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(c - dot(vNormal, vNormel), p);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, 1.0);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    
    const glowSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 32, 32),
      glowMaterial
    );
    glowSphere.position.set(x, y, z);
    this.scene.add(glowSphere);
    
    // Add label
    const labelDiv = document.createElement('div');
    labelDiv.className = 'node-label';
    labelDiv.textContent = label;
    labelDiv.style.color = '#ffffff';
    labelDiv.style.fontSize = '12px';
    labelDiv.style.fontWeight = 'bold';
    labelDiv.style.padding = '2px 6px';
    labelDiv.style.backgroundColor = `rgba(${new THREE.Color(color).r * 255}, ${new THREE.Color(color).g * 255}, ${new THREE.Color(color).b * 255}, 0.7)`;
    labelDiv.style.borderRadius = '4px';
    labelDiv.style.pointerEvents = 'none';
    
    const nodeLabel = new CSS2DObject(labelDiv);
    nodeLabel.position.set(0, 1.5, 0);
    sphere.add(nodeLabel);
    
    // Store additional data
    sphere.userData = {
      label: label,
      color: color,
      glowSphere: glowSphere,
      nodeLabel: nodeLabel,
      originalColor: color,
      originalScale: 1
    };
    
    return sphere;
  }
  
  createSubNodes(parentNode, properties, baseColor, radius, startAngle) {
    const parentPos = parentNode.position;
    const count = properties.length;
    
    properties.forEach((prop, i) => {
      const angle = startAngle + (i / count) * Math.PI * 0.75;
      const x = parentPos.x + Math.cos(angle) * radius;
      const y = parentPos.y + Math.sin(angle) * radius;
      const z = parentPos.z + (Math.random() - 0.5) * 2;
      
      // Create slightly varied color
      const colorVariation = 0.15;
      const variedColor = new THREE.Color(baseColor);
      variedColor.r += (Math.random() - 0.5) * colorVariation;
      variedColor.g += (Math.random() - 0.5) * colorVariation;
      variedColor.b += (Math.random() - 0.5) * colorVariation;
      
      const node = this.createNode(x, y, z, variedColor.getHex(), prop.name);
      node.userData.property = prop.key;
      node.scale.setScalar(0.7);
      
      this.createRelationship(parentNode, node, 0.4);
    });
  }
  
  createRelationship(nodeA, nodeB, opacity = 0.6) {
    const posA = nodeA.position;
    const posB = nodeB.position;
    
    // Create line
    const points = [];
    points.push(new THREE.Vector3(posA.x, posA.y, posA.z));
    points.push(new THREE.Vector3(posB.x, posB.y, posB.z));
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: opacity
    });
    
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    this.relationshipLines.push(line);
    
    return line;
  }
  
  clearGraph() {
    // Remove existing nodes
    Object.values(this.nodeObjects).forEach(node => {
      if (node.userData.glowSphere) {
        this.scene.remove(node.userData.glowSphere);
      }
      this.scene.remove(node);
    });
    
    // Remove existing relationships
    this.relationshipLines.forEach(line => {
      this.scene.remove(line);
    });
    
    this.nodeObjects = {};
    this.relationshipLines = [];
  }
  
  updateRecommendations() {
    // Get recommendations based on current inputs
    this.currentRecommendations = this.weldingKnowledge.getRecommendations(this.params);
    
    // Display recommendations
    let recommendationsHTML = `
      <h3 style="margin-top:0;color:#3498db">Welding Recommendations</h3>
      <div style="display:grid;grid-template-columns:auto 1fr;grid-gap:10px;align-items:start">
    `;
    
    if (this.currentRecommendations.amperage) {
      recommendationsHTML += `
        <div style="font-weight:bold">Amperage:</div>
        <div>${this.currentRecommendations.amperage}</div>
      `;
    }
    
    if (this.currentRecommendations.arcGap) {
      recommendationsHTML += `
        <div style="font-weight:bold">Arc Gap:</div>
        <div>${this.currentRecommendations.arcGap}</div>
      `;
    }
    
    if (this.currentRecommendations.rodAngle) {
      recommendationsHTML += `
        <div style="font-weight:bold">Rod Angle:</div>
        <div>${this.currentRecommendations.rodAngle}</div>
      `;
    }
    
    if (this.currentRecommendations.travelSpeed) {
      recommendationsHTML += `
        <div style="font-weight:bold">Travel Speed:</div>
        <div>${this.currentRecommendations.travelSpeed}</div>
      `;
    }
    
    if (this.currentRecommendations.motionPattern && this.currentRecommendations.motionPattern.length) {
      recommendationsHTML += `
        <div style="font-weight:bold">Motion Pattern:</div>
        <div>${this.currentRecommendations.motionPattern.join(', ')}</div>
      `;
    }
    
    if (this.currentRecommendations.adjustments && this.currentRecommendations.adjustments.length) {
      recommendationsHTML += `
        <div style="font-weight:bold;grid-column:span 2;margin-top:10px;border-top:1px solid rgba(255,255,255,0.3);padding-top:10px">
          Real-time Adjustments:
        </div>
        <ul style="grid-column:span 2;margin:5px 0;padding-left:20px">
      `;
      
      this.currentRecommendations.adjustments.forEach(adjustment => {
        recommendationsHTML += `<li>${adjustment}</li>`;
      });
      
      recommendationsHTML += `</ul>`;
    }
    
    recommendationsHTML += `</div>`;
    this.recommendationsElement.innerHTML = recommendationsHTML;
    
    // Update visualization to highlight recommended settings
    this.highlightRecommendedNodes();
  }
  
  highlightRecommendedNodes() {
    // Reset all nodes to original state
    Object.values(this.nodeObjects).forEach(node => {
      if (node.userData.originalColor) {
        node.material.color.setHex(node.userData.originalColor);
        node.material.emissive.setHex(node.userData.originalColor);
        node.material.emissiveIntensity = 0.2;
        node.userData.glowSphere.material.uniforms.glowColor.value.setHex(node.userData.originalColor);
        node.scale.setScalar(node.userData.originalScale);
      }
    });
    
    // Highlight central node
    const centralNode = this.nodeObjects.central;
    if (centralNode) {
      centralNode.material.emissiveIntensity = 0.5;
      centralNode.scale.setScalar(1.2);
    }
    
    // Highlight nodes based on recommendations
    if (this.currentRecommendations.arcGap) {
      this.highlightTechniqueNode('arcGap', this.currentRecommendations.arcGap);
    }
    
    if (this.currentRecommendations.rodAngle) {
      this.highlightTechniqueNode('rodAngle', this.currentRecommendations.rodAngle);
    }
    
    if (this.currentRecommendations.travelSpeed) {
      this.highlightTechniqueNode('travelSpeed', this.currentRecommendations.travelSpeed);
    }
    
    if (this.currentRecommendations.motionPattern && this.currentRecommendations.motionPattern.length) {
      this.highlightTechniqueNode('motionPattern', this.currentRecommendations.motionPattern[0]);
    }
  }
  
  highlightTechniqueNode(propertyKey, value) {
    Object.values(this.nodeObjects).forEach(node => {
      if (node.userData.property === propertyKey || 
          (node.userData.label && node.userData.label.toLowerCase().includes(propertyKey.toLowerCase()))) {
        
        // Highlight more if the label contains the recommended value
        if (node.userData.label && 
            node.userData.label.toLowerCase().includes(value.toLowerCase())) {
          node.material.emissiveIntensity = 0.8;
          node.scale.setScalar(1.4 * (node.userData.originalScale || 1));
          
          // Make glow stronger
          const glowColor = new THREE.Color(node.userData.originalColor);
          glowColor.r += 0.2;
          glowColor.g += 0.2;
          glowColor.b += 0.2;
          node.userData.glowSphere.material.uniforms.glowColor.value = glowColor;
          node.userData.glowSphere.material.uniforms.c.value = 0.2;
          node.userData.glowSphere.material.uniforms.p.value = 1.5;
        } else {
          // Regular highlight
          node.material.emissiveIntensity = 0.5;
          node.scale.setScalar(1.2 * (node.userData.originalScale || 1));
        }
      }
    });
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Update controls
    this.controls.update();
    
    // Update glow effects
    Object.values(this.nodeObjects).forEach(node => {
      if (node.userData.glowSphere) {
        node.userData.glowSphere.material.uniforms.viewVector.value = 
          new THREE.Vector3().subVectors(this.camera.position, node.position);
      }
    });
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }
  
  // Method to simulate real-time welding input
  simulateRealTimeInput() {
    // This could be connected to actual sensors or camera input
    // For demonstration, we'll cycle through different puddle states
    const puddleStates = ['Stiff', 'Moderate', 'VeryFluid'];
    const spreadStates = ['Narrow', 'Moderate', 'Wide'];
    const tieInStates = ['Poor', 'Adequate', 'Excellent'];
    
    let currentIndex = 0;
    
    const simulationInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % 3;
      
      this.params.observedPuddle = puddleStates[currentIndex];
      this.params.observedSpread = spreadStates[(currentIndex + 1) % 3];
      this.params.observedTieIn = tieInStates[(currentIndex + 2) % 3];
      
      // Update GUI controllers
      for (const controller of this.gui.controllers) {
        controller.updateDisplay();
      }
      
      this.updateRecommendations();
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(simulationInterval); // Return cleanup function
  }
}

// MAIN APP
function initWeldingVisualization() {
  // Create container
  const container = document.createElement('div');
  container.style.width = '100%';
  container.style.height = '100vh';
  container.style.position = 'relative';
  document.body.appendChild(container);
  
  // Create info panel
  const infoPanel = document.createElement('div');
  infoPanel.style.position = 'absolute';
  infoPanel.style.top = '10px';
  infoPanel.style.left = '10px';
  infoPanel.style.backgroundColor = 'rgba(0,0,0,0.7)';
  infoPanel.style.color = 'white';
  infoPanel.style.padding = '15px';
  infoPanel.style.borderRadius = '5px';
  infoPanel.style.maxWidth = '300px';
  infoPanel.style.fontFamily = 'Arial, sans-serif';
  infoPanel.innerHTML = `
    <h2 style="margin-top:0">Welding Knowledge Visualization</h2>
    <p>This interactive 3D visualization helps you navigate the complex relationships in SMAW/stick welding.</p>
    <p>Use the control panel to:</p>
    <ul>
      <li>Set your welding parameters</li>
      <li>Input real-time observations</li>
      <li>Receive technique recommendations</li>
    </ul>
    <p>Rotate: Left-click + drag<br>
    Pan: Right-click + drag<br>
    Zoom: Mouse wheel</p>
    <button id="startSimulation" style="padding:8px 12px;background:#3498db;border:none;color:white;border-radius:4px;cursor:pointer">
      Simulate Real-time Input
    </button>
  `;
  container.appendChild(infoPanel);
  
  // Initialize visualization
  const visualization = new WeldingKnowledgeVisualization(container);
  
  // Add simulation button functionality
  document.getElementById('startSimulation').addEventListener('click', () => {
    const stopSimulation = visualization.simulateRealTimeInput();
    
    const button = document.getElementById('startSimulation');
    button.textContent = 'Stop Simulation';
    button.style.background = '#e74c3c';
    
    button.addEventListener('click', () => {
      stopSimulation();
      button.textContent = 'Simulation Stopped';
      button.style.background = '#95a5a6';
      button.disabled = true;
    }, { once: true });
  });
  
  return visualization;
}

// Start the application when the page loads
window.onload = initWeldingVisualization;