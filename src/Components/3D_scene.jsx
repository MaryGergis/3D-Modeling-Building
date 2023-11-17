import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

const SevenFloorBuilding = () => {
  const [selectedFloor, setSelectedFloor] = useState(null);

  const containerRef = useRef();
  const floorDetailsDivRef = useRef(null);

  const floorDetails = useMemo(
    () => [
      'First Floor Details',
      'Second Floor Details',
      'Third Floor Details',
      'Fourth Floor Details',
      'Fifth Floor Details',
      'Sixth Floor Details',
      'Seventh Floor Details',
    ],
    []
  );

  useEffect(() => {
    let scene, camera, renderer, floors, pointers;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 50);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    const container = containerRef.current;
    container.appendChild(renderer.domElement);

    const gridHelper = new THREE.GridHelper(150, 100);
    scene.add(gridHelper);

    function createFloor(yPosition) {
      const floorGeometry = new THREE.BoxGeometry(15, 0.1, 10);
      const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
      const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
      floorMesh.position.y = yPosition;
      scene.add(floorMesh);
      return floorMesh;
    }

    floors = Array.from({ length: 7 }, (_, i) => createFloor(i * 3));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);

    function createPointers() {
      const pointerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const pointerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

      pointers = floors.map((floor) => {
        const pointersOnFloor = [];

        for (let i = 0; i < 5; i++) {
          const pointer = new THREE.Mesh(pointerGeometry, pointerMaterial);
          pointer.position.copy(floor.position);
          pointer.position.x += (i - 2) * 1.5;
          pointer.position.y += 0.75;
          pointer.visible = false;
          scene.add(pointer);
          pointersOnFloor.push(pointer);
        }

        return pointersOnFloor;
      });
    }

    createPointers();

    function handleClick(event) {
      const mouse = new THREE.Vector2();
      const raycaster = new THREE.Raycaster();

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(floors.flat());

      if (intersects.length > 0) {
        const selected = intersects[0].object;
        const index = floors.flat().indexOf(selected);

        if (index !== -1) {
          setSelectedFloor((prevIndex) => (prevIndex === index ? null : index));
        }
      }
    }

    document.addEventListener('mousedown', handleClick, false);

    const updateVisibility = () => {
      floors.forEach((floor, index) => {
        floor.visible = selectedFloor === null || index === selectedFloor;
        if (floor.visible) {
          const targetRotation = Math.PI / 2;
          const duration = 30;

          const currentRotation = { rotationY: floor.rotation.y };
          const target = { rotationY: targetRotation };

          new TWEEN.Tween(currentRotation)
            .to(target, duration * 10)
            .onUpdate(() => {
              floor.rotation.y = currentRotation.rotationY;
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        }

        pointers[index].forEach((pointer) => {
          pointer.visible = index === selectedFloor;
        });
      });

      const floorDetailsDiv = floorDetailsDivRef.current;
      if (floorDetailsDiv) {
        floorDetailsDiv.innerHTML = selectedFloor !== null ? floorDetails[selectedFloor] : '';
      }
    };

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize);

    const animate = () => {
      requestAnimationFrame(animate);
      TWEEN.update();
      updateVisibility();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      document.removeEventListener('mousedown', handleClick, false);
      window.removeEventListener('resize', onWindowResize);
      container.removeChild(renderer.domElement);
    };
  }, [selectedFloor, floorDetails]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '10px',
        }}
        ref={floorDetailsDivRef}
      ></div>
    </div>
  );
};

export default SevenFloorBuilding;
