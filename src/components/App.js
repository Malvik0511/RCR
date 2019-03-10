import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Button, Input, Checkbox } from "antd";
import '../styles/App.css';
import { FormGroup, HelpBlock, FormControl } from 'react-bootstrap';

const { Group: InputGroup } = Input;

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            size:{
                width: "",
                height: "",
                chance: ""
            },
            auto: true,
            matrix: [],
            domains:[],
            row:{
                width: "",
                height: "",
                chance: "",
                length: "",
            }
        };
    }

    onSizeChange = size =>
        this.setState({
            size
        }, this.reRenderMatrix);

    reRenderMatrix = () => {
        const matrix = this.generateMatrix();
        this.setMatrix(matrix);
    };

    onCellToggle = ({ i, j , value }) => {
        const { matrix } = this.state;

        matrix[i][j] = value;
        this.setMatrix(matrix, this.updateChance);
    };

    updateChance = () => {
        const chance = this.solveChance();
        const { width, height } = this.state.size;

        this.setState({
           size: { chance, width, height }
        });
    };

    onAutoToggle = auto =>
        this.setState({
            auto
        });

    onDomainResolve = domains =>
        this.setState({
            domains
        }, this.updateTable);

    clearDomain = () =>
        this.setState({
            domains: []
        });

    setMatrix = (matrix, callBack = () => {}) =>
        this.setState({
            matrix
        }, () => {
            callBack();
            this.clearDomain();
        });

    updateTable = () => {
        const row = {
            width: this.state.size.width,
            height: this.state.size.height,
            chance: this.state.size.chance,
            length: this.state.domains.length
        };

        this.setState({
            row
        })
    };

    solveChance = () =>
        ((this.state.matrix.map(item =>
            item.filter(elt => elt == 1)).reduce((accum, cur) =>
            [...accum, ...cur]).length / (this.state.size.width * this.state.size.height)) * 100)
                .toFixed(1);


    generateMatrix = () => {
        const { size, auto } = this.state;
        const { width, height } = size;
        let matrix = [];

        for (let i = 0; i < parseInt(height); i++){
            matrix[i] = [];
            for (let j = 0; j < parseInt(width); j++){
                matrix[i][j] = auto ? this.generateNumber() : 0;
            }
        }

        return matrix;
    };

    generateNumber = () => this.state.size.chance ?
        Math.random() * 100 < parseFloat(this.state.size.chance) ? 1 : 0 : Math.round(Math.random());

    render() {
        const { matrix, size, domains, auto } = this.state;
        const { height, width, chance } = size;

        return (
            <div>
                <header className="app__header">
                    <h2 className="app__header-text">Счетчик доменов</h2>
                </header>
                <article className="app__main-wrapper">
                    <div className="app__wrapper-sizer">
                        <MatrixSizer chance={ chance }
                                     width={ width }
                                     height={ height }
                                     auto={ auto }
                                     onSizeChange={ this.onSizeChange }
                                     onAutoToggle={ this.onAutoToggle }/>
                    </div>
                    <div className="app__main-info">
                        <div className="app__wrapper-matrix">
                            {
                                matrix &&
                                    <Matrix matrix={ matrix }
                                            domains={ domains }
                                            onDomainResolve={ this.onDomainResolve }
                                            onToggleCell={ this.onCellToggle }/>
                            }
                        </div>
                        <div  className="app__wrapper-result">
                        {
                            this.state.row.width && this.state.row.height &&
                                <ResultTable width={this.state.row.width}
                                             height={this.state.row.height}
                                             domainsLength={this.state.row.length}
                                             chance={this.state.row.chance}/>
                        }
                        </div>
                    </div>
                </article>
            </div>
        );
    }
}

class MatrixSizer extends React.Component{

    static propTypes = {
        width: PropTypes.string.isRequired,
        height: PropTypes.string.isRequired,
        auto: PropTypes.bool.isRequired,
        chance: PropTypes.string.isRequired,
        onAutoToggle: PropTypes.func.isRequired,
        onSizeChange: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            width: props.width,
            height: props.height,
            chance: props.height,
            form:{
                widthErr: false,
                heightErr: false,
                chanceErr: false
            }
        };
    };

    componentWillReceiveProps(nextProps){
        if (nextProps.chance !== this.props.chance){
            this.onChanceChange(nextProps.chance);
        }
    }

    validateSize = (size, errField) => {
        this.clearErr(errField);

        if (isNaN(Number(size))){
            this.setErr(errField, "!введите число")
        }

        if (parseInt(Number(size)) !== Number(size)){
            this.setErr(errField, "!целое число")
        }

        if (size < 1 || size > 40){
            this.setErr(errField, "!от 1 до 40")
        }
    };

    validateChance = (chance) => {
        const errField = "chanceErr";

        this.clearErr(errField);

        if (isNaN(Number(chance))){
            this.setErr(errField, "!введите число")
        }

        if (chance <= 0 || chance > 100){
            this.setErr(errField, "! больше 0 не более 100")
        }
    };

    setErr = (errField, value) => {
        const { form } = this.state;

        form[errField] = value;

        this.setState({
            form
        });

        setTimeout(()=> console.log(this.state.form))
    };

    clearErr = errField => {
        const { form } = errField ? this.state : {};

        if (errField) {
            form[errField] = false;
        }

        this.setState({
            form
        })

    };

    onWidthChange = width =>{
        this.validateSize(width,"widthErr");

        this.setState({
            width
        });
    };

    onHeightChange = height =>{
        this.validateSize(height,"heightErr");

        this.setState({
            height
        });
    };

    onChanceChange = (chance) =>{
        this.validateChance(chance)

        this.setState({
            chance
        });
    };

    onSetSize = () => {
        const { width, height, chance } = this.state;
        this.props.onSizeChange({ width, height, chance })
    };

    onAutoToggle = () =>
        this.props.onAutoToggle(!this.props.auto);

    render(){
        const { width, height, chance, form } = this.state;
        const { widthErr, heightErr, chanceErr } = form
        const { auto } = this.props;
        const isValid = !auto ? width.length &&  height.length && !widthErr && !heightErr :
            width.length &&  height.length  && chance.length && !widthErr && !heightErr && !chanceErr;

        return(
            <div className="matrix-sizer">
                <InputGroup compact className="matrix-sizer__input-group">
                    <FormGroup validationState={widthErr ? null : 'error'}>
                        <FormControl type="text"
                                     value={ width }
                                     placeholder="Столбцы"
                                     onChange={(e) => this.onWidthChange(e.target.value)} />
                        {
                            !isValid && widthErr &&
                            <div className="err">{widthErr}</div>
                        }
                    </FormGroup>
                    <FormGroup validationState={heightErr ? null : 'error'}>
                        <FormControl type="text"
                                     value={ height }
                                     placeholder="Строки"
                                     onChange={(e) => this.onHeightChange(e.target.value)} />
                        {
                            !isValid && heightErr &&
                            <div  className="err">{heightErr}</div>
                        }
                    </FormGroup>
                    {
                        auto &&
                        <FormGroup validationState={chanceErr ? null : 'error'}>
                            <FormControl type="text"
                                         value={ chance }
                                         placeholder="Вероятность"
                                         onChange={(e) => this.onChanceChange(e.target.value)} />
                            {
                                !isValid && chanceErr &&
                                <div  className="err">{chanceErr}</div>
                            }
                        </FormGroup>
                    }
                    <FormGroup>
                        <Button icon="check"
                                disabled={!isValid}
                                title="Задать размер"
                                onClick={ this.onSetSize }/>
                        <Checkbox checked={ auto }
                                  onChange={ this.onAutoToggle }/>
                        <label>Авто</label>
                    </FormGroup>
                </InputGroup>
            </div>
        )
    }
}

class Matrix extends React.Component{

    static propTypes = {
        matrix: PropTypes.array.isRequired,
        domains: PropTypes.array.isRequired,
        onDomainResolve: PropTypes.func.isRequired,
        onToggleCell: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            domains:[],
            busy: false
        };
    };

    componentWillReceiveProps(nextProps){
        this.setBusy(false);
    }

    setBusy = busy =>
        this.setState({
            busy
        });

    resolveDomain = () => {
        if (!this.state.busy) {
            this.setBusy(true);

            let pretend = this.props.matrix.map((row, i) => //формируем массив с индексами единиц
                row.map((item, j) => item === 1 ? [i + 1, j + 1] : null))
                .reduce((accum, curr) => [...accum, ...curr]).filter(item => item !== null);


            const solveDomains = (pretend) => {
                let rest = [];
                let res = pretend
                    .map((item, i, arr) => [item, ...arr.filter(elt => //выбор доменов
                        (Math.abs(item[0] - elt[0]) === 1 && item[1] === elt[1] ||
                            Math.abs(item[1] - elt[1]) === 1 && item[0] === elt[0]))])
                    .map(item => item.sort((a, b) => (a.join(",") - b.join(","))))//упорядочиваем элементы внутри домена по возрвставнию
                    .sort((a, b) => b.length - a.length)//упорядочиваем домены по убыванию количества элементов

                res.map((item, i) => {
                    let subres = [...item];
                    let needRec = false;
                    res.forEach((elt, j) => {
                        if (i !== j && subres.length <= elt.length) {
                            for (let k = 0; k < subres.length; k++) {
                                for (let z = 0; z < elt.length; z++) {
                                    if (subres[k].length && elt[z].length && elt[z].join(",") === subres[k].join(",")) {
                                        needRec = true;
                                        subres[k] = [];
                                    }
                                }
                            }
                        }
                    });

                    if (needRec) {
                        rest.push(...subres.filter(item => item.length));
                        res[i] = [];
                    }
                });

                if (rest.length) {
                    let pretend = rest.filter((item, i, arr) => arr.findIndex(elt => elt.join('') === item.join('')) === i);
                    return [...res.filter(item => item.length), ...solveDomains(pretend)];
                }

                return res.filter(item => item.length);
            };

            let domains = solveDomains(pretend);

            this.props.onDomainResolve(this.colorize(domains))
        }
    };

    colorize = (domains) => domains.map(domain => ({ value: domain, background: this.randomColor() }));

    randomColor = () =>
        `rgb(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)} 
        ,${Math.round(Math.random() * 255)})`;

    toggleCell = (i, j) =>
        this.props.onToggleCell({i, j, value: Number(!this.props.matrix[i][j])});

    render(){
        const { matrix, domains } = this.props;

        const prepairMatrix = matrix.map((row, i) =>
            row.map((cell, j) => {
                let background = "white";
                    domains.forEach(domain => {
                    if (domain.value.some(elt => (elt[0] === i + 1 && elt[1] === j + 1))){
                        background = domain.background;
                    }
                });

                return ({ value: cell, background: background });
            }));

        return(
            <div className="matrix">
            {
                prepairMatrix && prepairMatrix.map((row, i) =>
                    <div className="matrix__row" key={ i }>
                        {
                            row.map((cell, j) =>
                                <div className="matrix__cell-wrapper"
                                     style={{background: cell.background}}
                                     key={ j }>
                                    <div className="matrix__cell"
                                         onClick={() => this.toggleCell(i, j)}>{cell.value}</div>
                                </div>
                            )
                        }
                    </div>
                )
            }
            {
             prepairMatrix.length ?
                <Button type="primary"
                        loading={ this.state.busy }
                        onClick={this.resolveDomain}
                        className="matrix__resolve-btn">
                    Посчитать
                </Button> :
                 <div>Введите параметры матрицы</div>
            }
            </div>
        )
    }
}

class ResultTable extends React.Component{
    static propTypes = {
        domainsLength: PropTypes.number.isRequired,
        width: PropTypes.string.isRequired,
        height: PropTypes.string.isRequired,
        chance: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            row:[{
                ...props
            }]
        };
    };

    componentWillReceiveProps(nextProps){
        const { domainsLength, width, height, chance } = nextProps;
        const { domainsLength: curL, width: curW, height: curH, chance: curC } = this.props;

        if (width && height && (width !== curW || height !== curH || domainsLength !== curL || chance !== curC)){
            let newRow = [...this.state.row, {domainsLength, width, height, chance}];

            if (newRow.length > 10) {
                newRow = newRow.slice(1);
            }

            this.setState({
                row: newRow
            })
        }
    }

    render(){
        const { row } = this.state;

        return(
            <table>
                <thead>
                    <tr>
                        <th>Вероятность</th>
                        <th>Количество доменов</th>
                        <th>Размер</th>
                    </tr>
                </thead>
                <tbody>
                {
                    row.map((item, i) =>
                        <tr key={ i }>
                            <td>{item.chance}</td>
                            <td>{item.domainsLength}</td>
                            <td>{item.width} * {item.height}</td>
                        </tr>
                    )
                }
                </tbody>
            </table>
        )
    }
}

export default App;