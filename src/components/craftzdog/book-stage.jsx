import { useState, useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DogContainer, DogSpinner } from './voxel-dog-loader'
import { useColorMode } from '@chakra-ui/react'

function easeOutCirc(x) {
  return Math.sqrt(1 - Math.pow(x - 1, 4))
}
// REWRITTEN: fixed closed state, 5 page layers, rootGroup scale 0.55

const BookStage = () => {
  const refContainer = useRef()
  const refRenderer = useRef()
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  const isOpenRef = useRef(false)
  isOpenRef.current = isOpen

  const handleWindowResize = useCallback(() => {
    const { current: renderer } = refRenderer
    const { current: container } = refContainer
    if (container && renderer) {
      const scW = container.clientWidth
      const scH = container.clientHeight
      renderer.setSize(scW, scH)
    }
  }, [])

  useEffect(() => {
    const { current: container } = refContainer
    if (!container) return

    const scW = container.clientWidth
    const scH = container.clientHeight

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(scW, scH)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    if ('outputColorSpace' in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace
    }
    container.appendChild(renderer.domElement)
    refRenderer.current = renderer

    // --- Scene & Camera ---
    const scene = new THREE.Scene()
    const target = new THREE.Vector3(0, 0.5, 0)

    const camera = new THREE.PerspectiveCamera(34, scW / scH, 0.1, 1000)
    const initialCamDist = 8.0
    const initialCamElev = 4.5
    const initialAngle = 0.18 * Math.PI
    const initialCameraPosition = new THREE.Vector3(
      initialCamDist * Math.sin(initialAngle),
      initialCamElev,
      initialCamDist * Math.cos(initialAngle)
    )
    camera.position.copy(initialCameraPosition)
    camera.lookAt(target)

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(isDark ? 0xa0b2c6 : 0xf6efe6, 1.8)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xfff6ec, 2.6)
    mainLight.position.set(5, 12, 7)
    mainLight.castShadow = true
    mainLight.shadow.mapSize.width = 1024
    mainLight.shadow.mapSize.height = 1024
    scene.add(mainLight)

    const accentLight = new THREE.PointLight(isDark ? 0x88ccca : 0x319795, 2.4, 10)
    accentLight.position.set(0, 2.8, 0)
    scene.add(accentLight)

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.0
    controls.target = target
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2 + 0.02
    controls.minDistance = 4
    controls.maxDistance = 14

    // =========================================================================
    // Root group — scale the entire book+pedestal down uniformly
    // =========================================================================
    const rootGroup = new THREE.Group()
    rootGroup.scale.setScalar(0.55)
    scene.add(rootGroup)

    // =========================================================================
    // 1. Compact Pedestal
    // =========================================================================
    const pedestalGroup = new THREE.Group()
    pedestalGroup.position.set(0, 0, 0)
    // pedestalGroup is added to rootGroup below

    const pedestalMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x22242a : 0xe4dcce,
      roughness: 0.35,
      metalness: 0.2
    })
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.8
    })

    const standHeight = 0.2
    const standRadius = 1.8
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(standRadius, standRadius * 1.06, standHeight, 48),
      pedestalMat
    )
    stand.position.y = standHeight / 2
    stand.receiveShadow = true
    pedestalGroup.add(stand)

    const standRim = new THREE.Mesh(
      new THREE.TorusGeometry(standRadius * 1.03, 0.022, 16, 64),
      goldMat
    )
    standRim.rotation.x = Math.PI / 2
    standRim.position.y = standHeight
    pedestalGroup.add(standRim)

    // Top subtle glowing rune circle
    const topRingMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x88ccca : 0x319795,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    })
    const runeRing = new THREE.Mesh(
      new THREE.RingGeometry(0.9, 1.35, 48),
      topRingMat
    )
    runeRing.rotation.x = -Math.PI / 2
    runeRing.position.y = standHeight + 0.005
    pedestalGroup.add(runeRing)

    rootGroup.add(pedestalGroup)

    // =========================================================================
    // 2. The Book
    // =========================================================================
    const floorY = standHeight + 0.01
    const bookWidth = 1.35   // 单页宽度
    const bookLength = 2.05  // 书本前后长度
    const coverThick = 0.02  // 封面厚度
    const blockThick = 0.034 // 纸堆厚度，两者总和 0.054 < 0.06，确保合拢时严丝合缝
    const archPeakY = 0.16   // 展卷时纸页微拱最高点

    const coverMaterial = new THREE.MeshStandardMaterial({
      color: isDark ? 0x141e2c : 0x2e1e17, // 优雅深黑海蓝皮质 / 极深古铜黑皮
      roughness: 0.45,
      metalness: 0.15
    })
    const paperMaterial = new THREE.MeshStandardMaterial({
      color: 0xfcf6ec, // 象牙古籍纸
      roughness: 0.85,
      metalness: 0.02,
      side: THREE.DoubleSide
    })
    const paperEdgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xeadccb, // 纸边微金暗调
      roughness: 0.9,
      metalness: 0.05
    })
    const goldTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0xf3cf7a,
      roughness: 0.25,
      metalness: 0.85
    })

    const bookGroup = new THREE.Group()
    bookGroup.position.set(0, floorY, 0)
    bookGroup.rotation.y = -Math.PI / 8
    rootGroup.add(bookGroup)

    // Spine
    const spineMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.04, bookLength),
      coverMaterial
    )
    spineMesh.position.set(0, 0.02, 0)
    bookGroup.add(spineMesh)

    // -----------------------------------------------------------------------
    // LEFT cover pivot — hinge at left edge of spine (x = -0.06)
    // -----------------------------------------------------------------------
    const leftCoverPivot = new THREE.Group()
    leftCoverPivot.position.set(-0.06, 0.02, 0)
    bookGroup.add(leftCoverPivot)

    const leftCover = new THREE.Mesh(
      new THREE.BoxGeometry(bookWidth, coverThick, bookLength),
      coverMaterial
    )
    leftCover.position.set(-bookWidth / 2, coverThick / 2, 0)
    leftCover.castShadow = true
    leftCover.receiveShadow = true
    leftCoverPivot.add(leftCover)

    const leftCorner = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, coverThick + 0.005, 0.18),
      goldTrimMaterial
    )
    leftCorner.position.set(-bookWidth + 0.09, coverThick / 2, bookLength / 2 - 0.09)
    leftCoverPivot.add(leftCorner)

    // -----------------------------------------------------------------------
    // RIGHT cover pivot — hinge at right edge of spine (x = +0.06)
    // -----------------------------------------------------------------------
    const rightCoverPivot = new THREE.Group()
    rightCoverPivot.position.set(0.06, 0.02, 0)
    bookGroup.add(rightCoverPivot)

    const rightCover = new THREE.Mesh(
      new THREE.BoxGeometry(bookWidth, coverThick, bookLength),
      coverMaterial
    )
    rightCover.position.set(bookWidth / 2, coverThick / 2, 0)
    rightCover.castShadow = true
    rightCover.receiveShadow = true
    rightCoverPivot.add(rightCover)

    const rightCorner = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, coverThick + 0.005, 0.18),
      goldTrimMaterial
    )
    rightCorner.position.set(bookWidth - 0.09, coverThick / 2, bookLength / 2 - 0.09)
    rightCoverPivot.add(rightCorner)

    // -----------------------------------------------------------------------
    // 页面与纸块完全挂载在左右对应的旋转 Pivot 内，与封面 100% 物理同动！
    // -----------------------------------------------------------------------
    const segmentsX = 24
    const segmentsZ = 12
    const PAGE_LAYERS = 5

    const createArchedPageGeo = () => {
      const geo = new THREE.PlaneGeometry(bookWidth * 0.94, bookLength * 0.96, segmentsX, segmentsZ)
      geo.rotateX(-Math.PI / 2)
      return geo
    }

    // 左半边纸堆与内页（挂入 leftCoverPivot）
    const leftBlockMesh = new THREE.Mesh(
      new THREE.BoxGeometry(bookWidth * 0.92, blockThick, bookLength * 0.94),
      paperEdgeMaterial
    )
    leftBlockMesh.position.set(-bookWidth * 0.92 / 2 - 0.03, coverThick + blockThick / 2, 0)
    leftCoverPivot.add(leftBlockMesh)

    const leftPageGeos = []
    const leftPageMeshes = []
    for (let layer = 0; layer < PAGE_LAYERS; layer++) {
      const geo = createArchedPageGeo()
      const mat = new THREE.MeshStandardMaterial({
        color: layer === 0 ? 0xfcf6ec : 0xf0e8d8,
        roughness: 0.85 + layer * 0.02,
        metalness: 0.02,
        side: THREE.DoubleSide,
        transparent: layer > 0,
        opacity: layer === 0 ? 1.0 : 0.92 - layer * 0.08
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(-bookWidth * 0.94 / 2 - 0.02, coverThick + blockThick - layer * 0.003, 0)
      mesh.castShadow = layer === 0
      leftCoverPivot.add(mesh)
      leftPageGeos.push(geo)
      leftPageMeshes.push(mesh)
    }

    // 右半边纸堆与内页（挂入 rightCoverPivot）
    const rightBlockMesh = new THREE.Mesh(
      new THREE.BoxGeometry(bookWidth * 0.92, blockThick, bookLength * 0.94),
      paperEdgeMaterial
    )
    rightBlockMesh.position.set(bookWidth * 0.92 / 2 + 0.03, coverThick + blockThick / 2, 0)
    rightCoverPivot.add(rightBlockMesh)

    const rightPageGeos = []
    const rightPageMeshes = []
    for (let layer = 0; layer < PAGE_LAYERS; layer++) {
      const geo = createArchedPageGeo()
      const mat = new THREE.MeshStandardMaterial({
        color: layer === 0 ? 0xfcf6ec : 0xf0e8d8,
        roughness: 0.85 + layer * 0.02,
        metalness: 0.02,
        side: THREE.DoubleSide,
        transparent: layer > 0,
        opacity: layer === 0 ? 1.0 : 0.92 - layer * 0.08
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(bookWidth * 0.94 / 2 + 0.02, coverThick + blockThick - layer * 0.003, 0)
      mesh.castShadow = layer === 0
      rightCoverPivot.add(mesh)
      rightPageGeos.push(geo)
      rightPageMeshes.push(mesh)
    }

    // Click hitbox
    const clickBox = new THREE.Mesh(
      new THREE.BoxGeometry(bookWidth * 2.2, 0.8, bookLength * 1.1),
      new THREE.MeshBasicMaterial({ visible: false })
    )
    clickBox.position.set(0, 0.3, 0)
    bookGroup.add(clickBox)

    // =========================================================================
    // 3. Ordered Constellation & Celestial Orbits (上方受好评的有序星轨天体)
    // =========================================================================
    // 位于展开书页的正上方，光辉倾泻在隆起的白色纸页上
    const constellationCenter = new THREE.Vector3(0, 2.0, 0)
    const constellationGroup = new THREE.Group()
    constellationGroup.position.copy(constellationCenter)
    rootGroup.add(constellationGroup)

    const accentColor = isDark ? 0x88ccca : 0x319795
    const goldColor = 0xf3cf7a

    // Core Star (核心八面体星)
    const coreMat = new THREE.MeshBasicMaterial({
      color: goldColor,
      wireframe: true
    })
    const coreStar = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.18, 0),
      coreMat
    )
    constellationGroup.add(coreStar)

    // Orbital Rings
    const ringRadius1 = 1.3
    const ringRadius2 = 1.0
    const nodesPerRing = 12

    // Orbit 1
    const orbit1 = new THREE.Group()
    orbit1.rotation.x = Math.PI / 4
    orbit1.rotation.z = Math.PI / 6
    constellationGroup.add(orbit1)

    const orbitRingLineMat = new THREE.LineBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.4
    })
    const orbitCircleGeo1 = new THREE.BufferGeometry()
    const orbitCirclePts1 = []
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2
      orbitCirclePts1.push(Math.cos(a) * ringRadius1, Math.sin(a) * ringRadius1, 0)
    }
    orbitCircleGeo1.setAttribute('position', new THREE.Float32BufferAttribute(orbitCirclePts1, 3))
    orbit1.add(new THREE.Line(orbitCircleGeo1, orbitRingLineMat))

    // Orbit 2
    const orbit2 = new THREE.Group()
    orbit2.rotation.x = -Math.PI / 3
    orbit2.rotation.y = Math.PI / 5
    constellationGroup.add(orbit2)

    const orbitCircleGeo2 = new THREE.BufferGeometry()
    const orbitCirclePts2 = []
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2
      orbitCirclePts2.push(Math.cos(a) * ringRadius2, Math.sin(a) * ringRadius2, 0)
    }
    orbitCircleGeo2.setAttribute('position', new THREE.Float32BufferAttribute(orbitCirclePts2, 3))
    orbit2.add(new THREE.Line(orbitCircleGeo2, orbitRingLineMat))

    // Star Nodes
    const nodeMat = new THREE.MeshBasicMaterial({ color: accentColor })
    const goldNodeMat = new THREE.MeshBasicMaterial({ color: goldColor })
    const starNodeGeo = new THREE.SphereGeometry(0.045, 12, 12)

    const nodes1 = []
    for (let i = 0; i < nodesPerRing; i++) {
      const angle = (i / nodesPerRing) * Math.PI * 2
      const node = new THREE.Mesh(starNodeGeo, (i % 3 === 0) ? goldNodeMat : nodeMat)
      node.position.set(Math.cos(angle) * ringRadius1, Math.sin(angle) * ringRadius1, 0)
      orbit1.add(node)
      nodes1.push(node)
    }

    const nodes2 = []
    for (let i = 0; i < nodesPerRing; i++) {
      const angle = (i / nodesPerRing) * Math.PI * 2
      const node = new THREE.Mesh(starNodeGeo, (i % 2 === 0) ? nodeMat : goldNodeMat)
      node.position.set(Math.cos(angle) * ringRadius2, Math.sin(angle) * ringRadius2, 0)
      orbit2.add(node)
      nodes2.push(node)
    }

    // Dynamic Cross-Orbit Links
    const maxLines = 60
    const linkGeo = new THREE.BufferGeometry()
    const linkPositions = new Float32Array(maxLines * 2 * 3)
    linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPositions, 3))

    const linkLineMat = new THREE.LineBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    })
    const constellationLinks = new THREE.LineSegments(linkGeo, linkLineMat)
    scene.add(constellationLinks)

    // =========================================================================
    // 4. Interaction (Click vs Drag separation)
    // =========================================================================
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let pointerStartX = 0
    let pointerStartY = 0
    let pointerStartTime = 0

    const handlePointerDown = (event) => {
      pointerStartX = event.clientX
      pointerStartY = event.clientY
      pointerStartTime = Date.now()
    }

    const handlePointerUp = (event) => {
      const dx = event.clientX - pointerStartX
      const dy = event.clientY - pointerStartY
      const dist = Math.hypot(dx, dy)
      const duration = Date.now() - pointerStartTime

      // 仅当位移 < 6px 且按下时间 < 350ms 时判定为“纯点击”，排除旋转镜头的拖拽操作
      if (dist < 6 && duration < 350) {
        const rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObject(clickBox, false)
        if (intersects.length > 0) {
          setIsOpen((prev) => !prev)
        }
      }
    }

    renderer.domElement.addEventListener('pointerdown', handlePointerDown)
    renderer.domElement.addEventListener('pointerup', handlePointerUp)

    const autoOpenTimer = setTimeout(() => {
      setIsOpen(true)
    }, 1200)

    // =========================================================================
    // 5. Animation Loop
    // =========================================================================
    let req = null
    let frame = 0
    let currentOpen = 0 // 0: closed, 1: open

    const pA = new THREE.Vector3()
    const pB = new THREE.Vector3()

    const animate = (timestamp) => {
      req = requestAnimationFrame(animate)
      const time = timestamp * 0.001

      // 1-turn camera entrance
      frame = frame <= 100 ? frame + 1 : frame
      if (frame <= 100) {
        const p = initialCameraPosition
        const rotSpeed = -easeOutCirc(frame / 120) * Math.PI * 2

        camera.position.y = initialCamElev
        camera.position.x = p.x * Math.cos(rotSpeed) + p.z * Math.sin(rotSpeed)
        camera.position.z = p.z * Math.cos(rotSpeed) - p.x * Math.sin(rotSpeed)
        camera.lookAt(target)
      } else {
        controls.update()
      }

      // Smooth Open/Close damp
      const targetOpen = isOpenRef.current ? 1 : 0
      currentOpen += (targetOpen - currentOpen) * 0.045

      // -----------------------------------------------------------------------
      // Cover rotation:
      //   LEFT  pivot at x=-0.06, board extends to -x.
      //     CLOSED: rotation.z = -(PI/2-0.02) → board stands up vertically to the left
      //     OPEN:   rotation.z = 0             → board lies flat to the left
      //
      //   RIGHT pivot at x=+0.06, board extends to +x.
      //     CLOSED: rotation.z = +(PI/2-0.02) → board stands up vertically to the right
      //     OPEN:   rotation.z = 0             → board lies flat to the right
      // -----------------------------------------------------------------------
      const closedCoverAngle = Math.PI / 2 - 0.02
      leftCoverPivot.rotation.z  = -(1 - currentOpen) * closedCoverAngle
      rightCoverPivot.rotation.z =  (1 - currentOpen) * closedCoverAngle

      // -----------------------------------------------------------------------
      // Arched page deformation across all 5 layers (跟随展卷平滑隆起)
      // -----------------------------------------------------------------------
      const halfW = (bookWidth * 0.94) / 2

      for (let layer = 0; layer < PAGE_LAYERS; layer++) {
        const layerScale = 1.0 - layer * 0.12

        const leftPos = leftPageGeos[layer].attributes.position
        for (let i = 0; i < leftPos.count; i++) {
          const lx = leftPos.getX(i)
          const t = (lx + halfW) / (2 * halfW)
          const arch = Math.sin(t * Math.PI) * archPeakY * layerScale * currentOpen
          leftPos.setY(i, arch)
        }
        leftPos.needsUpdate = true
        leftPageGeos[layer].computeVertexNormals()

        const rightPos = rightPageGeos[layer].attributes.position
        for (let i = 0; i < rightPos.count; i++) {
          const rx = rightPos.getX(i)
          const t = 1 - (rx + halfW) / (2 * halfW)
          const arch = Math.sin(t * Math.PI) * archPeakY * layerScale * currentOpen
          rightPos.setY(i, arch)
        }
        rightPos.needsUpdate = true
        rightPageGeos[layer].computeVertexNormals()
      }

      // Pedestal rune ring rotation
      runeRing.rotation.z = time * 0.12

      // Constellation Orbits
      orbit1.rotation.z = time * 0.25
      orbit2.rotation.z = -time * 0.35
      coreStar.rotation.x = time * 0.6
      coreStar.rotation.y = time * 0.8

      // Starfield scales up as book opens
      const orbitScale = 0.08 + currentOpen * 0.92
      constellationGroup.scale.set(orbitScale, orbitScale, orbitScale)
      constellationGroup.position.y = 0.9 + currentOpen * 0.8

      // Cross-orbit lines computation
      let linkIdx = 0
      const linkArr = linkGeo.attributes.position.array

      constellationLinks.visible = currentOpen > 0.05
      if (currentOpen > 0.2) {
        coreStar.getWorldPosition(pA)
        for (let i = 0; i < nodes1.length && linkIdx < maxLines * 6; i += 2) {
          nodes1[i].getWorldPosition(pB)
          linkArr[linkIdx++] = pA.x; linkArr[linkIdx++] = pA.y; linkArr[linkIdx++] = pA.z;
          linkArr[linkIdx++] = pB.x; linkArr[linkIdx++] = pB.y; linkArr[linkIdx++] = pB.z;
        }

        for (let i = 0; i < nodes1.length && linkIdx < maxLines * 6; i += 3) {
          nodes1[i].getWorldPosition(pA)
          for (let j = 0; j < nodes2.length && linkIdx < maxLines * 6; j += 3) {
            nodes2[j].getWorldPosition(pB)
            if (pA.distanceTo(pB) < 1.1) {
              linkArr[linkIdx++] = pA.x; linkArr[linkIdx++] = pA.y; linkArr[linkIdx++] = pA.z;
              linkArr[linkIdx++] = pB.x; linkArr[linkIdx++] = pB.y; linkArr[linkIdx++] = pB.z;
            }
          }
        }
      }

      for (let k = linkIdx; k < maxLines * 6; k++) {
        linkArr[k] = 0
      }
      linkGeo.attributes.position.needsUpdate = true

      linkLineMat.opacity = (isDark ? 0.45 : 0.6) * currentOpen
      orbitRingLineMat.opacity = 0.4 * currentOpen

      renderer.render(scene, camera)
    }

    req = requestAnimationFrame(animate)
    setLoading(false)

    return () => {
      clearTimeout(autoOpenTimer)
      cancelAnimationFrame(req)
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
      renderer.domElement.removeEventListener('pointerup', handlePointerUp)
      renderer.domElement.remove()
      renderer.dispose()
      controls.dispose()
    }
  }, [isDark])

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize, false)
    return () => {
      window.removeEventListener('resize', handleWindowResize, false)
    }
  }, [handleWindowResize])

  return (
    <DogContainer ref={refContainer}>
      {loading && <DogSpinner />}
    </DogContainer>
  )
}

export default BookStage
