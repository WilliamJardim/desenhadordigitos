class Editor{
    constructor( config={} ){
        if( !config.resolucao ){ throw 'propriedade "resolucao" é obrigatória!' };

        if( config.cursor == undefined ){
            //Cursor com tudo padrão 
            config.cursor = {
                X: 0,
                Y: 0,
                width: 10,
                height: 10,
                opacity: 0.4
            };

        }else{
            //Cursor com alguns valores padrão 
            if( !config.cursor.X ){ config.cursor.X = 0 };
            if( !config.cursor.Y ){ config.cursor.Y = 0 };
            if( !config.cursor.width ){ config.cursor.width = 10 };
            if( !config.cursor.height ){ config.cursor.height = 10 };
            if( !config.cursor.opacity ){ config.cursor.opacity = 0.4 };
        }

        this.resolucao                   = config.resolucao;
        this.top                         = config.top  || 0;
        this.left                        = config.left || 0;

        this.drawCanvas                  = document.createElement('canvas');
        this.drawCanvas.setAttribute('id', String(new Date().getTime()));
        this.drawCanvas.setAttribute('class', 'canvas-draw');
        this.drawCanvas.style.position = "absolute";
        this.drawCanvas.style.top = `${ this.top }px`;
        this.drawCanvas.style.left = `${ this.left }px`;
        this.drawCanvas.style.zIndex = 1;
        this.drawCanvas.style.border = "solid 4px black";
        this.drawCanvas.setAttribute("oncontextmenu", "return false");

        this.previewCanvas               = document.createElement('canvas');
        this.previewCanvas.setAttribute('id', String(new Date().getTime()));
        this.previewCanvas.setAttribute('class', 'canvas-preview');
        this.previewCanvas.style.position = "absolute";
        this.previewCanvas.style.top = `${ this.top }px`;
        this.previewCanvas.style.left = `${ this.left }px`;
        this.previewCanvas.style.zIndex = 22;
        this.previewCanvas.style.border = "solid 4px black";
        this.previewCanvas.style.backgroundColor = "rgba(0,0,0,0)";
        this.previewCanvas.setAttribute("oncontextmenu", "return false");

        document.body.prepend(this.drawCanvas);
        document.body.prepend(this.previewCanvas);

        this.drawCanvas.style.width      = `${this.resolucao}px`;
        this.drawCanvas.style.height     = `${this.resolucao}px`;
        this.previewCanvas.style.width   = `${this.resolucao}px`;
        this.previewCanvas.style.height  = `${this.resolucao}px`;

        this.matrix = [];
        this.previewCanvasRef = this.previewCanvas;
        this.drawCanvasRef    = this.drawCanvas;

        //Mouse
        this.cursor = {
            X: config.cursor.X || 0,
            Y: config.cursor.Y || 0,
            width: config.cursor.width || 10,
            height: config.cursor.height || 10,
            opacity: config.cursor.opacity || 0.4,
            ativo: false,
            desenhando: false,
            apagando: false
        };

        //Cria uma imagem base
        this.width = this.resolucao;
        this.height = this.resolucao;
        this.newImage( this.width, this.height );

        //Eventos
        const context = this;

        context.criarEventos();

        this.onDesenhar.bind(this)();

    }

    criarEventos(){
        const context = this;

        this.previewCanvas.addEventListener('mouseenter', function(e){
            context.cursor.ativo = true;
        });
        this.previewCanvas.addEventListener('mouseleave', function(e){
            context.cursor.ativo = false;
            context.cursor.desenhando = false;
            context.cursor.apagando = false;
        });
        //Quando prescionar botão do mouse
        this.previewCanvas.addEventListener('mousedown', function(evento){
            //Botao esquerdo
            if (evento.button === 0) {
                context.cursor.desenhando = true;

            //Botao do meio
            }else if (evento.button === 1) {
                
            //Botao direito
            } else if (evento.button === 2) {
                context.cursor.apagando = true;
            }

        });
        //Quando soltar botão do mouse
        this.previewCanvas.addEventListener('mouseup', function(evento){
            //Botao esquerdo
            if (evento.button === 0) {
                context.cursor.desenhando = false;

            //Botao do meio
            }else if (evento.button === 1) {
                
            //Botao direito
            } else if (evento.button === 2) {
                context.cursor.apagando = false;
            }
        });
        this.previewCanvas.addEventListener('mousemove', function(e){
            const rect = context.previewCanvas.getBoundingClientRect();

            // Calcula a posição correta, considerando a escala do canvas
            const scaleX = context.previewCanvas.width / rect.width;
            const scaleY = context.previewCanvas.height / rect.height;
        
            // Obtém a posição do mouse em relação ao canvas
            const X = (e.clientX - rect.left) * scaleX;
            const Y = (e.clientY - rect.top) * scaleY;
        
            // Atualiza a posição do cursor no contexto
            context.cursor.X = parseInt(X);
            context.cursor.Y = parseInt(Y);
        });
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

    clearImage(){
        const drawContext     = this.drawCanvasRef.getContext('2d');
        const previewContext  = this.previewCanvasRef.getContext('2d');
    
        //Limpa tudo
        previewContext.clearRect(0,0, parseInt(this.previewCanvasRef.style.width), parseInt(this.previewCanvasRef.style.height) );
        drawContext.clearRect(0,0, parseInt(this.previewCanvasRef.style.width), parseInt(this.previewCanvasRef.style.height) );
        this.matrix = [];
        this.newImage( this.resolucao, this.resolucao );
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

const editor = new Editor({
    resolucao: 512,
    top: 0,
    left: window.innerWidth/2,

    //Configurações iniciais do cursor
    cursor: {
        X: 0,
        Y: 0,
        width: 10,
        height: 10,
        opacity: 0.4
    }
});