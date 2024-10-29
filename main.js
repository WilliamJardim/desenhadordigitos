const drawCanvas = document.getElementById('canvas-desenho');
const previewCanvas = document.getElementById('canvas-preview');
const resolucao = 600;

drawCanvas.style.width = `${resolucao}px`;
drawCanvas.style.height =  `${resolucao}px`;
previewCanvas.style.width =  `${resolucao}px`;
previewCanvas.style.height =  `${resolucao}px`;

class Editor{
    constructor( previewCanvasRef, drawCanvasRef ){
        this.matrix = [];
        this.previewCanvasRef = previewCanvasRef;
        this.drawCanvasRef    = drawCanvasRef;

        //Mouse
        this.cursor = {
            X: 0,
            Y: 0,
            width: 10,
            height: 10,
            opacity: 0.4,
            ativo: false,
            desenhando: false
        };

        //Cria uma imagem base
        this.width = resolucao;
        this.height = resolucao;
        this.newImage( this.width, this.height );

        //Eventos
        const context = this;

        previewCanvas.addEventListener('mouseenter', function(e){
            context.cursor.ativo = true;
        });
        previewCanvas.addEventListener('mouseleave', function(e){
            context.cursor.ativo = false;
        });
        previewCanvas.addEventListener('mousedown', function(e){
            context.cursor.desenhando = true;
        });
        previewCanvas.addEventListener('mouseup', function(e){
            context.cursor.desenhando = false;
        });
        previewCanvas.addEventListener('mousemove', function(e){
            const X = e.clientX;
            const Y = e.clientY;

            context.cursor.X = X;
            context.cursor.Y = Y;
        });

        this.onDesenhar.bind(this)();

    }

    onDesenhar(){

        const cursor          = this.getCursor();
        const drawContext     = this.drawCanvasRef.getContext('2d');
        const previewContext  = this.previewCanvasRef.getContext('2d');

        previewContext.clearRect(0,0, parseInt(this.previewCanvasRef.style.width), parseInt(this.previewCanvasRef.style.height) );
        previewContext.fillStyle = `rgba(0,0,0, ${cursor.opacity})`;
        previewContext.fillRect(cursor.X, cursor.Y, cursor.width, cursor.height);

        if( cursor.ativo == true && cursor.desenhando == true ){
            previewContext.clearRect(0,0, parseInt(this.previewCanvasRef.style.width), parseInt(this.previewCanvasRef.style.height) );

            //Desenha na tela
            drawContext.fillStyle = `rgba(0,0,0, ${cursor.opacity})`;
            drawContext.fillRect(cursor.X, cursor.Y, cursor.width, cursor.height);

            //Insere na matrix
            this.matrix[ cursor.X ][ cursor.Y ] += cursor.opacity;
            
        }

        //Cria um loop infinito
        requestAnimationFrame(this.onDesenhar.bind(this));
    }

    newImage( width, height ){
        this.matrix = [];

        for( let linha = 0 ; linha < width ; linha++ ){
            this.matrix[linha] = [];
            for( let coluna = 0 ; coluna < height ; coluna++ ){
                this.matrix[linha][coluna] = 0;
            }
        }
    }

    loadImage( imageMatrix ){
        const cursor          = this.getCursor();
        const imageWidth      = this.matrix.length;
        const imageHeight     = this.matrix[0].length;
        const drawContext     = this.drawCanvasRef.getContext('2d');
        const previewContext  = this.previewCanvasRef.getContext('2d');
        
        previewContext.clearRect(0,0, parseInt(this.previewCanvasRef.style.width), parseInt(this.previewCanvasRef.style.height) );
        drawContext.clearRect(0,0, parseInt(this.previewCanvasRef.style.width), parseInt(this.previewCanvasRef.style.height) );

        for( let linha = 0 ; linha < imageWidth ; linha++ ){
            for( let coluna = 0 ; coluna < imageHeight ; coluna++ ){

                const valorPixel = imageMatrix[linha][coluna];

                //Se tem pixel
                if( imageMatrix[linha][coluna] > 0 ){
                    //Desenha na tela
                    drawContext.fillStyle = `rgba(0,0,0, ${ valorPixel > 1 ? 1 : valorPixel })`;
                    drawContext.fillRect(linha, coluna, cursor.width, cursor.height);
                }

                //Insere na matrix
                this.matrix[ linha ][ coluna ] = valorPixel;
            }
        }
    }

    getImage(){
        return this.matrix;
    }

    getCursor(){
        return this.cursor;
    }
}

const editor = new Editor(previewCanvas, drawCanvas);
