import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useStore } from '../store/useStore';

function Viewport() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const meshMapRef = useRef(new Map());
  const originalGeometriesRef = useRef(new Map());
  const glyphGroupRef = useRef(new Map()); // Changed to Map for per-geometry glyphs
  const previewMeshRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  
  const [isCreating, setIsCreating] = useState(false);
  const [creationStart, setCreationStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedGeometry, setDraggedGeometry] = useState(null);
  const [dragOffset, setDragOffset] = useState(new THREE.Vector3());
  const [hoveredGeometry, setHoveredGeometry] = useState(null);

  const { geometries, loads, boundaryConditions, selection, setSelection, results, resultViewSettings, creationMode, setCreationMode, addGeometry, updateGeometry } = useStore();

  // Initialize scene
  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // ESC to cancel creation mode
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (creationMode) {
          setCreationMode(null);
          setIsCreating(false);
          if (previewMeshRef.current) {
            sceneRef.current.remove(previewMeshRef.current);
            previewMeshRef.current = null;
          }
        }
        if (isDragging) {
          setIsDragging(false);
          setDraggedGeometry(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      mountRef.current?.removeChild(renderer.domElement);
      controls.dispose();
      renderer.dispose();
    };
  }, [creationMode, setCreationMode, isDragging]);

  // Handle creation mode and dragging interactions
  useEffect(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    const controls = controlsRef.current;
    
    if (!renderer || !camera || !scene || !controls) return;

    const getGroundIntersection = (clientX, clientY) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersectPoint = new THREE.Vector3();
      raycasterRef.current.ray.intersectPlane(planeRef.current, intersectPoint);
      return intersectPoint;
    };

    const getMeshUnderMouse = (clientX, clientY) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const meshes = Array.from(meshMapRef.current.values());
      const intersects = raycasterRef.current.intersectObjects(meshes, false);
      
      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        for (const [id, mesh] of meshMapRef.current.entries()) {
          if (mesh === clickedMesh) {
            return { id, mesh, point: intersects[0].point };
          }
        }
      }
      return null;
    };

    const handleMouseDown = (event) => {
      if (creationMode) {
        // Creation mode
        controls.enabled = false;
        const point = getGroundIntersection(event.clientX, event.clientY);
        setCreationStart(point);
        setIsCreating(true);
      } else {
        // Selection and potential drag mode
        const hit = getMeshUnderMouse(event.clientX, event.clientY);
        
        if (hit) {
          setSelection({ type: 'geometry', id: hit.id });
          
          // Start dragging
          const groundPoint = getGroundIntersection(event.clientX, event.clientY);
          const mesh = hit.mesh;
          const offset = new THREE.Vector3().subVectors(
            new THREE.Vector3(mesh.position.x, 0, mesh.position.z),
            new THREE.Vector3(groundPoint.x, 0, groundPoint.z)
          );
          
          setDragOffset(offset);
          setDraggedGeometry(hit.id);
          setIsDragging(true);
          controls.enabled = false;
        } else {
          setSelection(null);
        }
      }
    };

    const handleMouseMove = (event) => {
      // Handle hover for cursor feedback
      if (!isCreating && !isDragging) {
        const hit = getMeshUnderMouse(event.clientX, event.clientY);
        setHoveredGeometry(hit ? hit.id : null);
      }

      if (isCreating && creationStart) {
        // Creation preview
        const currentPoint = getGroundIntersection(event.clientX, event.clientY);
        const distance = creationStart.distanceTo(currentPoint);
        
        if (previewMeshRef.current) {
          scene.remove(previewMeshRef.current);
          previewMeshRef.current.geometry.dispose();
          previewMeshRef.current.material.dispose();
        }

        let geometry;
        const size = Math.max(distance, 0.1);
        
        switch (creationMode) {
          case 'box':
            geometry = new THREE.BoxGeometry(size, size, size);
            break;
          case 'cylinder':
            geometry = new THREE.CylinderGeometry(size / 2, size / 2, size, 32);
            break;
          case 'sphere':
            geometry = new THREE.SphereGeometry(size / 2, 32, 32);
            break;
          default:
            return;
        }

        const material = new THREE.MeshStandardMaterial({ 
          color: 0x3498db,
          transparent: true,
          opacity: 0.5,
          metalness: 0.3,
          roughness: 0.7
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(creationStart);
        mesh.position.y = size / 2;
        
        scene.add(mesh);
        previewMeshRef.current = mesh;
      } else if (isDragging && draggedGeometry) {
        // Dragging existing geometry
        const groundPoint = getGroundIntersection(event.clientX, event.clientY);
        const newPosition = new THREE.Vector3(
          groundPoint.x + dragOffset.x,
          0,
          groundPoint.z + dragOffset.z
        );
        
        const mesh = meshMapRef.current.get(draggedGeometry);
        const geo = geometries.find(g => g.id === draggedGeometry);
        
        if (mesh && geo) {
          // Calculate proper Y position based on geometry type
          let yOffset = 0;
          switch (geo.type) {
            case 'box':
              yOffset = geo.height / 2;
              break;
            case 'cylinder':
              yOffset = geo.height / 2;
              break;
            case 'sphere':
              yOffset = geo.radius;
              break;
          }
          
          mesh.position.set(newPosition.x, yOffset, newPosition.z);
          
          // Update glyphs for this geometry
          updateGlyphsForGeometry(draggedGeometry);
        }
      }
    };

    const handleMouseUp = (event) => {
      if (isCreating && creationStart) {
        // Finalize creation
        const currentPoint = getGroundIntersection(event.clientX, event.clientY);
        const distance = creationStart.distanceTo(currentPoint);
        const size = Math.max(distance, 0.1);

        let geometryData;
        switch (creationMode) {
          case 'box':
            geometryData = {
              type: 'box',
              name: `Box-${Date.now()}`,
              width: size,
              height: size,
              depth: size,
              position: { x: creationStart.x, y: size / 2, z: creationStart.z }
            };
            break;
          case 'cylinder':
            geometryData = {
              type: 'cylinder',
              name: `Cylinder-${Date.now()}`,
              radius: size / 2,
              height: size,
              position: { x: creationStart.x, y: size / 2, z: creationStart.z }
            };
            break;
          case 'sphere':
            geometryData = {
              type: 'sphere',
              name: `Sphere-${Date.now()}`,
              radius: size / 2,
              position: { x: creationStart.x, y: size / 2, z: creationStart.z }
            };
            break;
        }

        if (geometryData) {
          addGeometry(geometryData);
        }

        if (previewMeshRef.current) {
          scene.remove(previewMeshRef.current);
          previewMeshRef.current.geometry.dispose();
          previewMeshRef.current.material.dispose();
          previewMeshRef.current = null;
        }

        setIsCreating(false);
        setCreationStart(null);
        setCreationMode(null);
        controls.enabled = true;
      } else if (isDragging && draggedGeometry) {
        // Finalize drag
        const mesh = meshMapRef.current.get(draggedGeometry);
        if (mesh) {
          updateGeometry(draggedGeometry, {
            position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z }
          });
        }
        
        setIsDragging(false);
        setDraggedGeometry(null);
        controls.enabled = true;
      }
    };

    const updateGlyphsForGeometry = (geoId) => {
      // Remove old glyphs for this geometry
      const oldGlyphs = glyphGroupRef.current.get(geoId);
      if (oldGlyphs) {
        oldGlyphs.forEach(glyph => {
          scene.remove(glyph);
          if (glyph.geometry) glyph.geometry.dispose();
          if (glyph.material) glyph.material.dispose();
        });
      }
      
      const newGlyphs = [];
      const geo = geometries.find(g => g.id === geoId);
      if (!geo) return;
      
      // Re-render glyphs for this geometry
      const geoLoads = loads.filter(l => l.targetGeometryId === geoId);
      const geoBCs = boundaryConditions.filter(bc => bc.targetGeometryId === geoId);
      
      [...geoLoads, ...geoBCs].forEach(item => {
        const glyphs = createGlyphsForItem(item, geo);
        glyphs.forEach(g => {
          scene.add(g);
          newGlyphs.push(g);
        });
      });
      
      glyphGroupRef.current.set(geoId, newGlyphs);
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);

    return () => {
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
    };
  }, [creationMode, isCreating, creationStart, isDragging, draggedGeometry, dragOffset, setSelection, setCreationMode, addGeometry, updateGeometry, geometries, loads, boundaryConditions]);

  // Update cursor based on hover state
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    
    if (creationMode) {
      renderer.domElement.style.cursor = 'crosshair';
    } else if (hoveredGeometry && !results) {
      renderer.domElement.style.cursor = 'move';
    } else {
      renderer.domElement.style.cursor = 'default';
    }
  }, [creationMode, hoveredGeometry, results]);

  // Helper function to create glyphs
  const createGlyphsForItem = (item, geo) => {
    const glyphs = [];
    const mesh = meshMapRef.current.get(geo.id);
    if (!mesh) return glyphs;

    const faceInfo = getFaceInfo(geo, item.faceIndex, mesh);
    if (!faceInfo) return glyphs;

    if (item.type === 'fixed') {
      // Boundary condition anchor
      const anchorGroup = new THREE.Group();
      
      const coneGeom = new THREE.ConeGeometry(0.15, 0.3, 8);
      const coneMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const cone = new THREE.Mesh(coneGeom, coneMat);
      cone.rotation.x = Math.PI;
      anchorGroup.add(cone);

      const sphereGeom = new THREE.SphereGeometry(0.1, 8, 8);
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.y = -0.15;
      anchorGroup.add(sphere);

      anchorGroup.position.copy(faceInfo.center);
      anchorGroup.position.addScaledVector(faceInfo.normal, 0.3);
      glyphs.push(anchorGroup);
    } else if (item.type === 'force') {
      const forceVec = new THREE.Vector3(item.force.x, item.force.y, item.force.z);
      const forceMag = forceVec.length();
      if (forceMag >= 0.001) {
        const arrowLength = Math.min(forceMag / 1000, 2);
        const arrowDir = forceVec.clone().normalize();
        
        const arrowHelper = new THREE.ArrowHelper(
          arrowDir,
          faceInfo.center,
          arrowLength,
          0x00ff00,
          arrowLength * 0.3,
          arrowLength * 0.2
        );
        glyphs.push(arrowHelper);
      }
    } else if (item.type === 'pressure') {
      const arrowDir = faceInfo.normal.clone().multiplyScalar(-1);
      
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          
          const offset = new THREE.Vector3();
          if (Math.abs(faceInfo.normal.x) > 0.5) {
            offset.set(0, i * 0.2, j * 0.2);
          } else if (Math.abs(faceInfo.normal.y) > 0.5) {
            offset.set(i * 0.2, 0, j * 0.2);
          } else {
            offset.set(i * 0.2, j * 0.2, 0);
          }
          
          const arrowPos = faceInfo.center.clone().add(offset);
          const arrow = new THREE.ArrowHelper(
            arrowDir,
            arrowPos,
            0.4,
            0x3498db,
            0.15,
            0.1
          );
          glyphs.push(arrow);
        }
      }
    }

    return glyphs;
  };

  const getFaceInfo = (geo, faceIndex, mesh) => {
    if (!mesh) return null;

    let center = new THREE.Vector3();
    let normal = new THREE.Vector3();

    if (geo.type === 'box') {
      const hw = geo.width / 2;
      const hh = geo.height / 2;
      const hd = geo.depth / 2;
      
      switch (faceIndex) {
        case 0: center.set(0, 0, hd); normal.set(0, 0, 1); break;
        case 1: center.set(0, 0, -hd); normal.set(0, 0, -1); break;
        case 2: center.set(0, hh, 0); normal.set(0, 1, 0); break;
        case 3: center.set(0, -hh, 0); normal.set(0, -1, 0); break;
        case 4: center.set(hw, 0, 0); normal.set(1, 0, 0); break;
        case 5: center.set(-hw, 0, 0); normal.set(-1, 0, 0); break;
        default: center.set(0, hh, 0); normal.set(0, 1, 0);
      }
    } else if (geo.type === 'cylinder') {
      const hh = geo.height / 2;
      switch (faceIndex) {
        case 0: center.set(0, hh, 0); normal.set(0, 1, 0); break;
        case 1: center.set(0, -hh, 0); normal.set(0, -1, 0); break;
        case 2: center.set(geo.radius, 0, 0); normal.set(1, 0, 0); break;
        default: center.set(0, hh, 0); normal.set(0, 1, 0);
      }
    } else if (geo.type === 'sphere') {
      center.set(0, geo.radius, 0);
      normal.set(0, 1, 0);
    }

    center.add(mesh.position);
    return { center, normal };
  };

  // Sync geometries with scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    for (const [id, mesh] of meshMapRef.current.entries()) {
      if (!geometries.find(g => g.id === id)) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
        meshMapRef.current.delete(id);
        originalGeometriesRef.current.delete(id);
        
        // Remove glyphs
        const glyphs = glyphGroupRef.current.get(id);
        if (glyphs) {
          glyphs.forEach(g => {
            scene.remove(g);
            if (g.geometry) g.geometry.dispose();
            if (g.material) g.material.dispose();
          });
          glyphGroupRef.current.delete(id);
        }
      }
    }

    geometries.forEach(geo => {
      if (!meshMapRef.current.has(geo.id)) {
        let geometry;
        switch (geo.type) {
          case 'box':
            geometry = new THREE.BoxGeometry(geo.width, geo.height, geo.depth);
            break;
          case 'cylinder':
            geometry = new THREE.CylinderGeometry(geo.radius, geo.radius, geo.height, 32);
            break;
          case 'sphere':
            geometry = new THREE.SphereGeometry(geo.radius, 32, 32);
            break;
          default:
            geometry = new THREE.BoxGeometry(1, 1, 1);
        }

        originalGeometriesRef.current.set(geo.id, geometry.clone());

        const material = new THREE.MeshStandardMaterial({ 
          color: 0x3498db,
          metalness: 0.3,
          roughness: 0.7,
          vertexColors: false
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(geo.position.x, geo.position.y, geo.position.z);
        mesh.rotation.set(geo.rotation.x, geo.rotation.y, geo.rotation.z);
        
        scene.add(mesh);
        meshMapRef.current.set(geo.id, mesh);
      }
    });
  }, [geometries]);

  // Update selection highlight and dragging visual feedback
  useEffect(() => {
    meshMapRef.current.forEach((mesh, id) => {
      const isSelected = selection?.type === 'geometry' && selection?.id === id;
      const isBeingDragged = isDragging && draggedGeometry === id;
      const isHovered = hoveredGeometry === id && !creationMode && !results;
      
      if (!results) {
        if (isBeingDragged) {
          mesh.material.emissive.setHex(0x88ff88);
        } else if (isSelected) {
          mesh.material.emissive.setHex(0x555555);
        } else if (isHovered) {
          mesh.material.emissive.setHex(0x222222);
        } else {
          mesh.material.emissive.setHex(0x000000);
        }
      }
    });
  }, [selection, isDragging, draggedGeometry, hoveredGeometry, creationMode, results]);

  // Render glyphs for loads and BCs
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || results) return;

    // Clear all glyphs
    glyphGroupRef.current.forEach((glyphs, geoId) => {
      glyphs.forEach(g => {
        scene.remove(g);
        if (g.geometry) g.geometry.dispose();
        if (g.material) g.material.dispose();
      });
    });
    glyphGroupRef.current.clear();

    // Re-render all glyphs
    geometries.forEach(geo => {
      const geoLoads = loads.filter(l => l.targetGeometryId === geo.id);
      const geoBCs = boundaryConditions.filter(bc => bc.targetGeometryId === geo.id);
      
      const allGlyphs = [];
      [...geoLoads, ...geoBCs].forEach(item => {
        const glyphs = createGlyphsForItem(item, geo);
        glyphs.forEach(g => {
          scene.add(g);
          allGlyphs.push(g);
        });
      });
      
      if (allGlyphs.length > 0) {
        glyphGroupRef.current.set(geo.id, allGlyphs);
      }
    });
  }, [loads, boundaryConditions, geometries, results]);

  // Apply results coloring and deformation
  useEffect(() => {
    if (!results) {
      meshMapRef.current.forEach((mesh, geoId) => {
        mesh.material.vertexColors = false;
        mesh.material.color.setHex(0x3498db);
        mesh.material.needsUpdate = true;
        
        const originalGeom = originalGeometriesRef.current.get(geoId);
        if (originalGeom) {
          mesh.geometry.dispose();
          mesh.geometry = originalGeom.clone();
        }
      });
      return;
    }

    const { fieldType, showDeformed, deformationScale } = resultViewSettings;
    const fieldData = fieldType === 'displacement' ? results.displacement : results.stress;

    geometries.forEach(geo => {
      const mesh = meshMapRef.current.get(geo.id);
      if (!mesh) return;

      const geoResults = results.geometryResults[geo.id];
      if (!geoResults) return;

      const values = fieldType === 'displacement' ? geoResults.displacements : geoResults.stresses;
      
      const originalGeom = originalGeometriesRef.current.get(geo.id);
      if (originalGeom) {
        mesh.geometry.dispose();
        mesh.geometry = originalGeom.clone();
      }

      if (showDeformed && fieldType === 'displacement') {
        const positions = mesh.geometry.attributes.position;
        const normals = mesh.geometry.attributes.normal;
        
        for (let i = 0; i < positions.count; i++) {
          const valueIndex = Math.floor((i / positions.count) * values.length);
          const displacement = values[valueIndex] * deformationScale * 1000;
          
          const nx = normals.getX(i);
          const ny = normals.getY(i);
          const nz = normals.getZ(i);
          
          positions.setX(i, positions.getX(i) + nx * displacement);
          positions.setY(i, positions.getY(i) + ny * displacement);
          positions.setZ(i, positions.getZ(i) + nz * displacement);
        }
        positions.needsUpdate = true;
        mesh.geometry.computeVertexNormals();
      }

      const colors = new Float32Array(mesh.geometry.attributes.position.count * 3);
      for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
        const valueIndex = Math.floor((i / mesh.geometry.attributes.position.count) * values.length);
        const value = values[valueIndex];
        const normalized = (value - fieldData.min) / (fieldData.max - fieldData.min);
        const color = getColorForValue(normalized);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }
      
      mesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      mesh.material.vertexColors = true;
      mesh.material.needsUpdate = true;
    });
  }, [results, resultViewSettings, geometries]);

  const getColorForValue = (normalized) => {
    const value = Math.max(0, Math.min(1, normalized));
    
    if (value < 0.25) {
      const t = value / 0.25;
      return { r: 0, g: t, b: 1 };
    } else if (value < 0.5) {
      const t = (value - 0.25) / 0.25;
      return { r: 0, g: 1, b: 1 - t };
    } else if (value < 0.75) {
      const t = (value - 0.5) / 0.25;
      return { r: t, g: 1, b: 0 };
    } else {
      const t = (value - 0.75) / 0.25;
      return { r: 1, g: 1 - t, b: 0 };
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mountRef} className="viewport" />
      {creationMode && (
        <div className="creation-mode-indicator">
          <span className="creation-icon">✏️</span>
          <span>Click and drag to create {creationMode}</span>
          <span className="creation-hint">Press ESC to cancel</span>
        </div>
      )}
      {isDragging && (
        <div className="creation-mode-indicator" style={{ background: 'rgba(76, 175, 80, 0.95)' }}>
          <span className="creation-icon">✋</span>
          <span>Moving geometry</span>
          <span className="creation-hint">Release to place • ESC to cancel</span>
        </div>
      )}
      {results && <ColorLegend results={results} fieldType={resultViewSettings.fieldType} />}
    </div>
  );
}

function ColorLegend({ results, fieldType }) {
  const fieldData = fieldType === 'displacement' ? results.displacement : results.stress;
  const unit = fieldType === 'displacement' ? 'm' : 'MPa';
  const formatValue = (val) => {
    if (fieldType === 'displacement') {
      return val.toExponential(2);
    } else {
      return (val / 1e6).toFixed(1);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '12px',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      minWidth: '150px'
    }}>
      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#2c3e50' }}>
        {fieldType === 'displacement' ? 'Displacement' : 'von Mises Stress'}
      </div>
      <div style={{ 
        height: '150px', 
        width: '30px', 
        background: 'linear-gradient(to top, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000)',
        borderRadius: '2px',
        marginBottom: '8px'
      }} />
      <div style={{ fontSize: '11px', color: '#666' }}>
        <div>Max: {formatValue(fieldData.max)} {unit}</div>
        <div>Min: {formatValue(fieldData.min)} {unit}</div>
      </div>
    </div>
  );
}

export default Viewport;
