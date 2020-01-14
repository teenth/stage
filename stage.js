const CANVAS_ID = 'mask-canvas'

export default class Stage {
  constructor () {
    this.canvas = null
    this.canvasWrap = null
    this.ctx = null
    this.stepArr = []
    this.current = {}
    this.currentNode = null
    this.resize = this.resize.bind(this)
  }
  show (rect) {
    let canvas = document.querySelector(`#${CANVAS_ID}`)
    if (!canvas) {
      this.createCanvas()
    }
    let userRect = this.onlighted({rect, wrap: this.canvasWrap})
    this.updateCanvas(Object.assign({}, rect, userRect))
  }
  updateCanvas (rect, opacity = 0.7) {
    let {width, height} = this.getRect(this.canvasWrap)
    this.canvas.width = width
    this.canvas.height = height
    
    this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight)
    this.ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`
    this.ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight)

    this.ctx.clearRect(rect.left, rect.top, rect.width, rect.height)
  }
  onlighted (rect) {
    if (this.current.onlighted) {
     return this.current.onlighted(rect)
    }
  }
  steps (arr) {
    this.stepArr = arr
  }
  jump (index) {
    this.current = this.stepArr[index]
    this.handleEleShow(this.current)
  }
  async handleEleShow (current) {
    if (typeof current.ele === 'string') {
      this.currentNode = document.querySelector(current.ele)
      let rect = this.getRect(this.currentNode)
      await this.pageScroll(rect)
      rect = this.getRect(this.currentNode)
      this.show(rect)
    }
  }
  async start (index = 0) {
    this.current = this.stepArr[index]
    document.body.style.overflow = 'hidden'
    window.addEventListener('resize', this.resize, false)
    this.handleEleShow(this.current)
  }
  async resize () {
    
    let rect = this.getRect(this.currentNode)
      await this.pageScroll(rect)
      rect = this.getRect(this.currentNode)
      this.show(rect)
  }
  pageScroll (rect) {
    let rootWrap = this.current.rootWrap
    let rootNode = window
    let scollDis
    if (rootWrap && typeof rootWrap === 'string') {
      rootNode = document.querySelector(rootWrap)
      let rootRect = this.getRect(rootNode)
      scollDis = (rect.top + rect.height - rootRect.height) / 2 
    } else {
      let absoluteTop = rect.top + window.pageYOffset
      scollDis = absoluteTop - window.innerHeight / 2
    }
    return new Promise(resolve => {
      if (rootNode.scrollTo) {
        rootNode.scrollTo({
          left: 0,
          top: scollDis,
          behavior: 'smooth'
        })
      } else {
        rootNode.scrollLeft = 0
        rootNode.scrollTop = scollDis
      }
      if ((window.pageYOffset >0 || scollDis > 0) && rootNode.scrollTo) {
        setTimeout(() => {
          resolve()
        }, 500)
      } else {
        resolve()
      }
    }) 
  }
  getRect (node) {
    let {left, top, width, height} = node.getBoundingClientRect()
    return {
      left,
      top,
      width,
      height
    }
  }
  end () {
    document.body.style.overflow = ''
    if (this.canvasWrap && this.canvasWrap.parentNode) {
      this.canvasWrap.parentNode.removeChild(this.canvasWrap)
    }
    window.removeEventListener('resize', this.resize, false)
  }
  createCanvas () {
    let canvas = document.createElement('canvas')
    let canvasWrap = document.createElement('div')
    this.canvas = canvas
    this.canvasWrap = canvasWrap
    canvasWrap.style.zIndex = 10000
    canvasWrap.style.position = 'fixed'
    canvasWrap.style.left = '0px'
    canvasWrap.style.right = '0px'
    canvasWrap.style.top = '0px'
    canvasWrap.style.bottom = '0px'
    canvas.id = CANVAS_ID
    document.body.appendChild(canvasWrap)
    let {width, height} = this.getRect(canvasWrap)
    canvas.width = width
    canvas.height = height
    canvasWrap.appendChild(canvas)
    this.ctx = canvas.getContext('2d')
  }
}