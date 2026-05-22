import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import Controls from '../containers/controls.jsx';
import Blocks from '../containers/blocks.jsx';
import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import AppStateHOC from '../lib/app-state-hoc.jsx';

import styles from './blocks-only.css';

const mapStateToProps = state => ({vm: state.scratchGui.vm});

const VMBlocks = connect(mapStateToProps)(Blocks);
const VMControls = connect(mapStateToProps)(Controls);

// Problocks — auto-load the custom Bricks extension as soon as the VM is
// ready, and expose the VM on window so parent shells can introspect it.
// Pure side-effect container; renders nothing.
const VMBootstrap = connect(mapStateToProps)(class extends React.Component {
    componentDidMount () { this._load(this.props.vm); }
    componentDidUpdate (prev) { if (prev.vm !== this.props.vm) this._load(this.props.vm); }
    _load (vm) {
        if (!vm || vm.__bricksLoaded) return;
        vm.__bricksLoaded = true;
        try { window.__scratchVM = vm; } catch (e) { /* noop */ }
        try {
            if (vm.extensionManager && typeof vm.extensionManager.loadExtensionIdSync === 'function') {
                vm.extensionManager.loadExtensionIdSync('bricks');
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('[bricks] failed to auto-load extension', e);
        }
    }
    render () { return null; }
});

const BlocksOnly = props => (
    <GUI {...props}>
        <VMBlocks
            grow={1}
            options={{
                media: `static/blocks-media/`
            }}
        />
        <VMControls className={styles.controls} />
        <VMBootstrap />
    </GUI>
);

const App = AppStateHOC(HashParserHOC(BlocksOnly));

const appTarget = document.createElement('div');
document.body.appendChild(appTarget);

ReactDOM.render(<App />, appTarget);
