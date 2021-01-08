import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'index.js',
    output: {
      file: 'dist/sql-formatter.js',
      format: 'es',
    },
    plugins: [
      resolve(),
      commonjs({
        include: /node_modules/,
      }),
    ],
  };